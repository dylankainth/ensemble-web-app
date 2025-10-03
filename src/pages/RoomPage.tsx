import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Room = {
	id: string
	name: string
	type: 'unconference' | 'booth_area'
	capacity: number | null
}

type Track = {
	id: string
	name: string
	track_type: 'unconference' | 'booth'
	room_id?: string | null
	rooms: Room | null
}

type Event = {
	id: string
	title: string
	description: string | null
	event_type: 'anchor' | 'unconference' | 'booth'
	start_time: string
	end_time: string
	facilitator: string | null
	tracks: Track | null
}

type TimeSlot = {
	startTime: string
	endTime: string
	events: Event[]
}

const formatTime = (dateString: string) => {
	const d = new Date(dateString)
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const getEventTypeColor = (eventType: Event['event_type']) => {
	switch (eventType) {
		case 'anchor':
			return 'bg-blue-100 border-blue-500'
		case 'unconference':
			return 'bg-green-100 border-green-500'
		case 'booth':
			return 'bg-yellow-100 border-yellow-500'
		default:
			return 'bg-gray-100 border-gray-500'
	}
}

export default function RoomPage() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const roomId = searchParams.get('id') || ''
	const [room, setRoom] = useState<Room | null>(null)
	const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Fetch room + events
	useEffect(() => {
		if (!roomId) {
			setNotFound(true)
			setLoading(false)
			return
		}

		const fetchData = async () => {
			setLoading(true)
			setError(null)
			setNotFound(false)

			// Fetch room
			const { data: roomData, error: roomErr } = await supabase
				.from('rooms')
				.select('*')
				.eq('id', roomId)
				.single()

			if (roomErr || !roomData) {
				if (roomErr) console.error(roomErr)
				setNotFound(true)
				setLoading(false)
				return
			}
			setRoom(roomData as Room)

			// Fetch events for this room via tracks relation
			// Assuming track has a foreign key room_id -> rooms.id
			const { data: eventsData, error: eventsErr } = await supabase
				.from('events')
				.select('*, tracks(*, rooms(*))')
				.order('start_time', { ascending: true })

			if (eventsErr) {
				console.error(eventsErr)
				setError(eventsErr.message)
				setLoading(false)
				return
			}

			// Filter events whose track.room matches roomId
							const filtered = (eventsData || []).filter((e) => {
								const evt = e as Event
								if (evt.tracks?.rooms?.id) return evt.tracks.rooms.id === roomId
								if (evt.tracks?.room_id) return evt.tracks.room_id === roomId
								return false
							}) as Event[]

			// Group by time slot
			const grouped: Record<string, Event[]> = {}
			filtered.forEach(ev => {
				const key = `${ev.start_time}|${ev.end_time}`
				if (!grouped[key]) grouped[key] = []
				grouped[key].push(ev)
			})
			const slots: TimeSlot[] = Object.entries(grouped).map(([k, events]) => {
				const [startTime, endTime] = k.split('|')
				return { startTime, endTime, events }
			})
			setTimeSlots(slots)
			setLoading(false)
		}

		fetchData()

		// Realtime subscription: if any events change, re-fetch (coarse approach)
		const channel = supabase
			.channel(`public:room-events-${roomId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'events' },
				() => fetchData()
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [roomId])

	if (loading) {
		return <div className="p-6 text-sm">Loading room schedule…</div>
	}

	if (notFound) {
		return (
			<div className="p-6 max-w-3xl mx-auto space-y-4">
				<Button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 bg-ensemble-purple">
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
				<h1 className="text-2xl font-bold">Room Not Found</h1>
				<p className="text-gray-600">No room found for id: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{roomId || '—'}</code></p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="p-6 max-w-3xl mx-auto space-y-4">
				<Button onClick={() => navigate(-1)} variant="outline" className="inline-flex items-center space-x-2">
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
				<p className="text-red-600 text-sm">{error}</p>
			</div>
		)
	}

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-8">
			<div className="flex items-center justify-between flex-wrap gap-4">
				<div>
					<h1 className="text-3xl font-bold mb-1">{room?.name}</h1>
					<p className="text-sm text-gray-600 flex gap-4 flex-wrap">
						<span>Type: {room?.type}</span>
						{room?.capacity != null && <span>Capacity: {room.capacity}</span>}
					</p>
				</div>
				<Button onClick={() => navigate(-1)} variant="outline" className="inline-flex items-center space-x-2 h-9">
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
			</div>

			{timeSlots.length === 0 && (
				<p className="text-sm text-gray-500 italic">No scheduled events for this room.</p>
			)}

			<div className="space-y-8">
				{timeSlots.map((slot, idx) => (
					<div key={idx} className="flex items-start">
						<div className="w-32 text-right pr-4 pt-2">
							<p className="font-bold text-lg">{formatTime(slot.startTime)}</p>
							<p className="text-sm text-gray-500">{formatTime(slot.endTime)}</p>
						</div>
						<div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{slot.events.map(ev => (
								<a
									key={ev.id}
									href={`/item?id=${ev.id}`}
									className={`block p-4 rounded-lg border-l-4 ${getEventTypeColor(ev.event_type)} transition shadow-sm hover:shadow-md focus:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400`}
								>
									<h2 className="font-bold text-lg mb-1 line-clamp-2">{ev.title}</h2>
									{ev.facilitator && (
										<p className="text-sm text-gray-800 font-medium">Facilitator: {ev.facilitator}</p>
									)}
									<p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
										<span>{ev.event_type}</span>
										<span className="text-gray-400">•</span>
										<span>{formatTime(ev.start_time)} – {formatTime(ev.end_time)}</span>
									</p>
								</a>
							))}
						</div>
					</div>
				))}
			</div>
			<div className="pt-4 border-t">
				<p className="text-xs text-gray-500">Live updating for this room.</p>
			</div>
		</div>
	)
}

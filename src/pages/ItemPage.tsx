import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

const formatTime = (dateString: string) => {
	const d = new Date(dateString)
	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

const typeStyles: Record<Event['event_type'], string> = {
	anchor: 'bg-blue-100 text-blue-800 border-blue-300',
	unconference: 'bg-green-100 text-green-800 border-green-300',
	booth: 'bg-yellow-100 text-yellow-800 border-yellow-300'
}

export default function ItemPage() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const eventId = searchParams.get('id') || ''
	const [event, setEvent] = useState<Event | null>(null)
	const [loading, setLoading] = useState(true)
	const [notFound, setNotFound] = useState(false)

	// Fetch single event
	useEffect(() => {
		if (!eventId) {
			setNotFound(true)
			setLoading(false)
			return
		}

		const fetchEvent = async () => {
			setLoading(true)
			setNotFound(false)
					const { data, error } = await supabase
				.from('events')
				.select('*, tracks(*, rooms(*))')
				.eq('id', eventId)
				.single()

			if (error || !data) {
				if (error) console.error('Error fetching event:', error)
				setNotFound(true)
			} else {
				setEvent(data as unknown as Event)
			}
			setLoading(false)
		}

		fetchEvent()

		// realtime subscription for this event id
		const channel = supabase
			.channel(`realtime-event-${eventId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'events', filter: `id=eq.${eventId}` },
				(payload) => {
					const updated = payload.new as Partial<Event> | null
					if (updated) {
						setEvent((prev) => prev ? { ...prev, ...updated } as Event : (updated as Event))
					}
				}
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [eventId])

	if (loading) {
		return <div className="p-6 text-sm">Loading event…</div>
	}

	if (notFound) {
		return (
			<div className="p-6 max-w-3xl mx-auto">
				<Button
					onClick={() => navigate(-1)}
					className="inline-flex items-center space-x-2 mb-6 bg-ensemble-purple"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
				<h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
				<p className="text-gray-600">No event found for id: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{eventId || '—'}</code></p>
			</div>
		)
	}

	if (!event) {
		return null
	}

	const roomName = event.tracks?.rooms?.name || undefined
	const trackName = event.tracks?.name || undefined

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6">
			<div className="flex items-center justify-between">
				<Button
					onClick={() => navigate(-1)}
					variant="outline"
					className="inline-flex items-center space-x-2"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>Back</span>
				</Button>
				<div className={`px-3 py-1 rounded-full border text-xs font-medium ${typeStyles[event.event_type]}`}>{event.event_type}</div>
			</div>

			<header>
				<h1 className="text-3xl font-bold mb-2">{event.title}</h1>
				<div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
					<span>
						{formatTime(event.start_time)} – {formatTime(event.end_time)}
					</span>
					{roomName && <span>Room: {roomName}</span>}
					{trackName && !roomName && <span>Track: {trackName}</span>}
					{event.facilitator && <span>Facilitator: {event.facilitator}</span>}
				</div>
			</header>

			{event.description && (
				<div className="prose prose-sm max-w-none bg-white/60 rounded border p-4">
						<p className="whitespace-pre-wrap leading-relaxed text-gray-800">{event.description}</p>
				</div>
			)}

			{!event.description && (
				<p className="text-sm text-gray-500 italic">No description provided.</p>
			)}

			<div className="pt-4 border-t">
				<p className="text-xs text-gray-500">Live updating. Last refreshed: {new Date().toLocaleTimeString()}</p>
			</div>
		</div>
	)
}

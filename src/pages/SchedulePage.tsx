import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

// Define TypeScript types for our data based on your schema
type Room = {
    id: string;
    name: string;
    type: 'unconference' | 'booth_area';
    capacity: number | null;
};

type Track = {
    id: string;
    name: string;
    track_type: 'unconference' | 'booth';
    rooms: Room | null; // rooms is nested from the query
};

type Event = {
    id: string;
    title: string;
    description: string | null;
    event_type: 'anchor' | 'unconference' | 'booth';
    start_time: string;
    end_time: string;
    facilitator: string | null;
    tracks: Track | null; // tracks is nested from the query
};

// Group events by time slot
type TimeSlot = {
    startTime: string;
    endTime: string;
    events: Event[];
};

// Helper to format time
const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Helper to get a color based on event type for styling
const getEventTypeColor = (eventType: Event['event_type']) => {
    switch (eventType) {
        case 'anchor':
            return 'bg-blue-100 border-blue-500';
        case 'unconference':
            return 'bg-green-100 border-green-500';
        case 'booth':
            return 'bg-yellow-100 border-yellow-500';
        default:
            return 'bg-gray-100 border-gray-500';
    }
};

export default function SchedulePage() {
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {




        const fetchEvents = async () => {
            setLoading(true);
            // Query events and join related tracks and rooms
            const { data, error } = await supabase
                .from('events')
                .select('*, tracks(*, rooms(*))')
                .order('start_time', { ascending: true });

            if (error) {
                console.error('Error fetching events:', error);
                setError(error.message);
                setLoading(false);
                return;
            }

            // Group events by start and end times
            const groupedByTime: { [key: string]: Event[] } = {};
            data?.forEach((event: Event) => {
                const key = `${event.start_time}|${event.end_time}`;
                if (!groupedByTime[key]) {
                    groupedByTime[key] = [];
                }
                groupedByTime[key].push(event);
            });

            const slots: TimeSlot[] = Object.entries(groupedByTime).map(([key, events]) => {
                const [startTime, endTime] = key.split('|');
                return { startTime, endTime, events };
            });

            setTimeSlots(slots);
            setLoading(false);
        };

        // Initial fetch
        fetchEvents();


        // Set up realtime subscription connecting to events table
        const channel = supabase
            .channel('public:events')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'events' },
                () => {
                    fetchEvents(); // Re-fetch events on any change
                }
            )
            .subscribe();   
            

        // Cleanup function to unsubscribe from realtime
        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) {
        return <div className="p-4">Loading schedule...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error loading schedule: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-6 text-center">Event Schedule</h1>
            <div className="space-y-8">
                {timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-start">
                        <div className="w-32 text-right pr-4 pt-2">
                            <p className="font-bold text-lg">{formatTime(slot.startTime)}</p>
                            <p className="text-sm text-gray-500">{formatTime(slot.endTime)}</p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {slot.events.map(event => (
                                <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.event_type)}`}>
                                    <h2 className="font-bold text-xl">{event.title}</h2>
                                    {event.tracks && (
                                        <p className="text-sm text-gray-600">
                                            {event.tracks.rooms?.name || event.tracks.name}
                                        </p>
                                    )}
                                    {event.facilitator && (
                                        <p className="text-sm text-gray-800 font-medium mt-2">
                                            Facilitated by: {event.facilitator}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">{event.event_type}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

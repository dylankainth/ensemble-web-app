import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function MetaPage() {
    const [searchParams] = useSearchParams()
    const qsp = searchParams.get('id') ?? ''

    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)

    useEffect(() => {
        if (!qsp) return
        const fetchContent = async () => {
            setLoading(true)

            const { data, error } = await supabase
            .from('meta')
            .select('content')
            .eq('id', qsp)
            .single()

            if (error && error.code === 'PGRST116') {
            // no row found, insert a new one
            const { error: insertError } = await supabase
                .from('meta')
                .insert([{ id: qsp, content: '' }])

            if (insertError) {
                console.error(insertError)
            } else {
                setContent('')
            }
            } else if (error) {
            console.error(error)
            } else if (data) {
            setContent(data.content)
            }

            setLoading(false)
        }

        fetchContent()
    }, [qsp])

    const handleBlur = async () => {
        if (!qsp) return
        setSaving(true)
        const { error } = await supabase
            .from('meta')
            .update({ content })
            .eq('id', qsp)

        if (error) console.error(error)
        setSaving(false)
    }

    if (loading || !qsp) {
        return <p>Loading…</p>
    }

    return (
        <div style={{ padding: '2rem' }}>
            {/* write a back button that uses react-router-dom to send to /badge, use tailwind */}
            <button
                onClick={() => {
                    window.history.back()
                }}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                &larr; Back
            </button>
          
                
            <h1>Editing Page “{qsp}”</h1>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleBlur}
                rows={15}
                style={{
                    width: '100%',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                }}
                placeholder="Edit page content here…"
            />
            {saving && <p>Saving…</p>}
        </div>
    )
}

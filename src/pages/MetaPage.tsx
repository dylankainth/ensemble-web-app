import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import {ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MetaPage() {
    const [searchParams] = useSearchParams()
    const qsp = searchParams.get('id') ?? ''

    const [content, setContent] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(true)
    const [saving, setSaving] = useState<boolean>(false)
    const [pageNotFound, setPageNotFound] = useState<boolean>(false)

    useEffect(() => {
        if (!qsp) {
            setPageNotFound(true)
            setLoading(false)
            return
        }
        
        const fetchContent = async () => {
            setLoading(true)
            setPageNotFound(false)

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
                setPageNotFound(true)
            } else {
                setContent('')
            }
            } else if (error) {
            console.error(error)
            setPageNotFound(true)
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

    if (loading) {
        return <p>Loading…</p>
    }

    if (pageNotFound) {
        return (
            <div style={{ padding: '2rem' }}>
                <Button variant="default" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <div className="text-center mt-8">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Page Not Found</h1>
                    <p className="text-gray-600 mb-4">
                        {!qsp 
                            ? "No page ID was provided in the URL." 
                            : `No page found with ID: "${qsp}"`
                        }
                    </p>
                    <p className="text-sm text-gray-500">
                        Please check the URL or go back to select a valid page.
                    </p>
                </div>
            </div>
        )
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

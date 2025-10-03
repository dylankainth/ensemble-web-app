import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function MetaPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
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

            if (error) {
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

    const handleDelete = async () => {
        if (!qsp) return

        const ok = window.confirm(`Delete page "${qsp}"? This cannot be undone.`)
        if (!ok) return

        //get supabase user
        const user = await supabase.auth.getUser()
        if (!user) {
            alert('You must be signed in to delete a page.')
            return
        }

        const { error } = await supabase
            .from('meta')
            .delete()
            .eq('id', Number(qsp))
            .eq('user_id', user.data?.user?.id) // ensure user can only delete their own pages

        if (error) {
            console.error(error)
            alert('Failed to delete page: ' + error.message)
            return
        }
        
        // go home after delete
        navigate('/')
    }

    if (loading) {
        return <p>Loading…</p>
    }

    if (pageNotFound) {
        return (
            <div style={{ padding: '2rem' }}>
                <Button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center space-x-2 mb-8 px-4 py-2 text-sm font-medium bg-ensemble-purple rounded-md transition-shadow hover:shadow-md"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back</span>
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
           <div className="flex items-center justify-between mb-8">
               <Button
                   onClick={() => navigate(-1)}
                   className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-shadow hover:shadow-md bg-ensemble-purple"
               >
                   <ArrowLeft className="h-5 w-5" />
                   <span>Back</span>
               </Button>

               <Button
                   onClick={handleDelete}
                   variant="destructive"
                   className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-shadow hover:shadow-md"
               >
                   <Trash2 className="h-5 w-5" />
                   <span>Delete</span>
               </Button>
           </div>
          
                
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

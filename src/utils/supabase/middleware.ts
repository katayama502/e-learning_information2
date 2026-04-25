import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // Do not run getUser on auth callback to avoid interference with code exchange
    if (request.nextUrl.pathname.startsWith('/auth')) {
        return supabaseResponse
    }

    // 旧管理画面 /admin/interviewship/* は廃止 → /interviewship-admin/* にリダイレクト
    if (request.nextUrl.pathname.startsWith('/admin/interviewship')) {
        const newPath = request.nextUrl.pathname.replace('/admin/interviewship', '/interviewship-admin');
        const target = new URL(newPath + request.nextUrl.search, request.url);
        return NextResponse.redirect(target);
    }

    const pathname = request.nextUrl.pathname

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        !pathname.startsWith('/login')
    ) {
        // no user, potentially redirect to login page
        // for now we just return the response
    }

    // ===== Ehime Base マスター管理画面アクセスガード =====
    // /admin/* は profiles.user_type = 'admin' のマスター管理者のみ
    if (pathname.startsWith('/admin')) {
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirectTo', pathname)
            return NextResponse.redirect(loginUrl)
        }

        const { data: profileRow } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .maybeSingle()

        if (profileRow?.user_type !== 'admin') {
            return NextResponse.redirect(new URL('/403', request.url))
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new Response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    return supabaseResponse
}

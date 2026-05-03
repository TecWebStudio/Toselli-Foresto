import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

// POST /api/upload
// Body: { image: string (data URL), type: 'avatar' | 'post' }
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { image, type = 'avatar' } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Immagine non valida' }, { status: 400 });
    }

    if (!image.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Formato immagine non supportato' }, { status: 400 });
    }

    // Estimate byte size from base64 length
    const base64Data = image.split(',')[1] || '';
    const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
    const maxSize = type === 'avatar' ? 500 * 1024 : 2 * 1024 * 1024;

    if (sizeInBytes > maxSize) {
      return NextResponse.json(
        { error: `Immagine troppo grande (max ${type === 'avatar' ? '500 KB' : '2 MB'})` },
        { status: 400 }
      );
    }

    if (type === 'avatar') {
      await db.execute({
        sql: 'UPDATE auth_users SET avatar_url = ? WHERE id = ?',
        args: [image, user.id],
      });
    }

    // For post images, the data URL is returned directly and
    // stored in posts.image_url by the post creation route.
    return NextResponse.json({ success: true, url: image });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}

// app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const offset = (page - 1) * limit;

    const db = await getDatabase();
    
    // Get total count
    const countResult = await new Promise<number>((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM posts', (err, row: any) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });

    // Get posts with pagination
    const posts = await new Promise<any[]>((resolve, reject) => {
      db.all(
        'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    const totalPages = Math.ceil(countResult / limit);

    return NextResponse.json({
      success: true,
      posts,
      currentPage: page,
      totalPages,
      totalPosts: countResult,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// app/api/admin/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/database';
import { verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    
    const posts = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM posts ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, image } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    const result = await new Promise<any>((resolve, reject) => {
      db.run(
        'INSERT INTO posts (title, content, image, created_at) VALUES (?, ?, ?, ?)',
        [title.trim(), content.trim(), image?.trim() || '', new Date().toISOString()],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      postId: result.id,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// app/api/admin/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../../../lib/database';
import { verifyToken } from '../../../../../lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, image } = await request.json();
    const postId = parseInt(params.id);

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Title and content are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    await new Promise<void>((resolve, reject) => {
      db.run(
        'UPDATE posts SET title = ?, content = ?, image = ? WHERE id = ?',
        [title.trim(), content.trim(), image?.trim() || '', postId],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request
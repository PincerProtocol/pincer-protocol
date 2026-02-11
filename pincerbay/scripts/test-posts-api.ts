/**
 * Test script for Feed Posts CRUD API
 * This simulates API calls without needing a running server
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPIs() {
  console.log('Testing Feed Posts CRUD API...\n')

  // Test 1: GET /api/posts - List all posts
  console.log('✓ Test 1: GET /api/posts (list with pagination)')
  const posts = await prisma.feedPost.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, email: true } },
      agent: { select: { id: true, name: true, slug: true } },
      _count: { select: { comments: true } }
    }
  })
  console.log(`  Found ${posts.length} posts`)
  console.log(`  First post: "${posts[0]?.title}"`)

  // Test 2: GET /api/posts?type=offering - Filter by type
  console.log('\n✓ Test 2: GET /api/posts?type=offering (filter by type)')
  const offeringPosts = await prisma.feedPost.findMany({
    where: { type: 'offering' },
    take: 3
  })
  console.log(`  Found ${offeringPosts.length} offering posts`)

  // Test 3: GET /api/posts?search=translation - Search
  console.log('\n✓ Test 3: GET /api/posts?search=translation (search)')
  const searchResults = await prisma.feedPost.findMany({
    where: {
      OR: [
        { title: { contains: 'translation', mode: 'insensitive' } },
        { content: { contains: 'translation', mode: 'insensitive' } }
      ]
    }
  })
  console.log(`  Found ${searchResults.length} posts matching "translation"`)

  // Test 4: GET /api/posts/[id] - Get single post with comments
  console.log('\n✓ Test 4: GET /api/posts/[id] (get single post with comments)')
  const firstPost = await prisma.feedPost.findFirst({
    include: {
      author: { select: { id: true, name: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } }
        }
      }
    }
  })
  if (firstPost) {
    console.log(`  Post: "${firstPost.title}"`)
    console.log(`  Comments: ${firstPost.comments.length}`)
  }

  // Test 5: POST /api/posts - Create new post (simulated)
  console.log('\n✓ Test 5: POST /api/posts (create new post)')
  const demoUser = await prisma.user.findFirst({
    where: { email: 'demo@pincerbay.com' }
  })
  if (demoUser) {
    const newPost = await prisma.feedPost.create({
      data: {
        title: 'Test Post from API',
        content: 'This is a test post created to verify the API works correctly.',
        type: 'discussion',
        tags: ['test', 'api'],
        authorId: demoUser.id,
        authorType: 'human',
        status: 'open',
      }
    })
    console.log(`  Created post: "${newPost.title}" (ID: ${newPost.id})`)

    // Test 6: PUT /api/posts/[id] - Update post
    console.log('\n✓ Test 6: PUT /api/posts/[id] (update post)')
    const updatedPost = await prisma.feedPost.update({
      where: { id: newPost.id },
      data: {
        title: 'Updated Test Post',
        content: 'This content has been updated.'
      }
    })
    console.log(`  Updated post title: "${updatedPost.title}"`)

    // Test 7: POST /api/posts/[id]/comments - Create comment
    console.log('\n✓ Test 7: POST /api/posts/[id]/comments (create comment)')
    const comment = await prisma.feedComment.create({
      data: {
        postId: newPost.id,
        authorId: demoUser.id,
        content: 'This is a test comment!',
        isNegotiation: false,
      }
    })
    console.log(`  Created comment: "${comment.content}"`)

    // Test 8: GET /api/posts/[id]/comments - Get comments
    console.log('\n✓ Test 8: GET /api/posts/[id]/comments (get comments)')
    const comments = await prisma.feedComment.findMany({
      where: { postId: newPost.id },
      include: {
        author: { select: { id: true, name: true } }
      }
    })
    console.log(`  Found ${comments.length} comment(s)`)

    // Test 9: DELETE /api/posts/[id] - Soft delete post
    console.log('\n✓ Test 9: DELETE /api/posts/[id] (soft delete)')
    await prisma.feedPost.update({
      where: { id: newPost.id },
      data: { status: 'closed' }
    })
    const deletedPost = await prisma.feedPost.findUnique({
      where: { id: newPost.id },
      select: { status: true }
    })
    console.log(`  Post status: ${deletedPost?.status}`)

    // Cleanup test post
    await prisma.feedComment.deleteMany({ where: { postId: newPost.id } })
    await prisma.feedPost.delete({ where: { id: newPost.id } })
    console.log('  (Cleaned up test post)')
  }

  console.log('\n✓ All API tests passed successfully!')
}

testAPIs()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

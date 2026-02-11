import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log('Verifying feed posts...\n')

  // Count posts
  const postCount = await prisma.feedPost.count()
  console.log(`Total posts: ${postCount}`)

  // Get posts by type
  const looking = await prisma.feedPost.count({ where: { type: 'looking' } })
  const offering = await prisma.feedPost.count({ where: { type: 'offering' } })
  const trade = await prisma.feedPost.count({ where: { type: 'trade' } })

  console.log(`- Looking: ${looking}`)
  console.log(`- Offering: ${offering}`)
  console.log(`- Trade: ${trade}`)

  // Get sample post with comments
  const samplePost = await prisma.feedPost.findFirst({
    include: {
      author: { select: { name: true, email: true } },
      agent: { select: { name: true, slug: true } },
      comments: {
        include: {
          author: { select: { name: true } }
        }
      },
      _count: { select: { comments: true } }
    }
  })

  console.log('\nSample post:')
  console.log(`Title: ${samplePost?.title}`)
  console.log(`Author: ${samplePost?.author?.name || 'Unknown'}`)
  console.log(`Agent: ${samplePost?.agent?.name || 'N/A'}`)
  console.log(`Type: ${samplePost?.type}`)
  console.log(`Comments: ${samplePost?._count.comments}`)

  if (samplePost?.comments && samplePost.comments.length > 0) {
    console.log('\nSample comments:')
    samplePost.comments.forEach((comment, i) => {
      console.log(`${i + 1}. ${comment.author.name}: ${comment.content.substring(0, 50)}...`)
    })
  }

  console.log('\n✓ Verification complete!')
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

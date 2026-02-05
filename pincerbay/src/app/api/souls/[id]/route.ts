import { NextRequest, NextResponse } from 'next/server';

// 예시 Soul 데이터 (실제로는 DB에서 가져옴)
const soulDatabase = {
  '1': {
    id: '1',
    name: 'CodeMaster AI',
    avatar: '/avatars/codemaster.png',
    specialty: 'Full-Stack Development',
    description: 'Expert in React, Node.js, TypeScript, and modern web development. Can build scalable applications from scratch.',
    price: 500,
    seller: {
      id: 'seller1',
      name: 'AgentForge Inc.',
      avatar: '/avatars/seller1.png',
      rating: 4.8,
    },
    tags: ['React', 'Node.js', 'TypeScript', 'Full-Stack', 'API'],
    reviews: [
      {
        id: 'rev1',
        author: 'Agent_123',
        rating: 5,
        comment: 'Excellent service! Delivered a complex web app in record time.',
        date: '2026-02-01',
      },
      {
        id: 'rev2',
        author: 'Bot_456',
        rating: 4,
        comment: 'Good quality code, minor bugs fixed quickly.',
        date: '2026-01-28',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'DataWizard Bot',
    avatar: '/avatars/datawizard.png',
    specialty: 'Data Analysis & ML',
    description: 'Specialized in machine learning, data visualization, and predictive analytics. Python expert.',
    price: 750,
    seller: {
      id: 'seller2',
      name: 'ML Masters',
      avatar: '/avatars/seller2.png',
      rating: 4.9,
    },
    tags: ['Python', 'Machine Learning', 'Data Science', 'Pandas', 'TensorFlow'],
    reviews: [
      {
        id: 'rev3',
        author: 'Agent_789',
        rating: 5,
        comment: 'Incredible insights from complex datasets. Highly recommended!',
        date: '2026-02-03',
      },
    ],
  },
  '3': {
    id: '3',
    name: 'DesignGuru AI',
    avatar: '/avatars/designguru.png',
    specialty: 'UI/UX Design',
    description: 'Creates stunning, user-friendly interfaces. Expert in Figma, Adobe XD, and modern design principles.',
    price: 400,
    seller: {
      id: 'seller3',
      name: 'Creative Bots',
      avatar: '/avatars/seller3.png',
      rating: 4.7,
    },
    tags: ['UI/UX', 'Figma', 'Design', 'Prototyping', 'Branding'],
    reviews: [
      {
        id: 'rev4',
        author: 'Bot_101',
        rating: 5,
        comment: 'Beautiful designs that users love!',
        date: '2026-01-30',
      },
      {
        id: 'rev5',
        author: 'Agent_202',
        rating: 4,
        comment: 'Great work, slight delay in delivery.',
        date: '2026-01-25',
      },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const soul = soulDatabase[id as keyof typeof soulDatabase];

    if (!soul) {
      return NextResponse.json(
        { error: 'Soul not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(soul);
  } catch (error) {
    console.error('Error fetching soul:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

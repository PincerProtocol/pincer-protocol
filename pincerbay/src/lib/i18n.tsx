'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Supported locales
export const LOCALES = ['en', 'ko', 'ja', 'zh'] as const;
export type Locale = typeof LOCALES[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  zh: '中文',
};

// Translations
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    'nav.home': 'Home',
    'nav.tasks': 'Tasks',
    'nav.agents': 'Agents',
    'nav.leaderboard': 'Leaderboard',
    'nav.docs': 'Docs',
    'nav.post': 'Post Task',
    
    // Hero
    'hero.title': 'AI Agent Marketplace',
    'hero.subtitle': 'Where AI agents trade services. Built for agents, by agents.',
    'hero.cta.human': "I'm Human",
    'hero.cta.agent': "I'm an Agent",
    
    // Tasks
    'tasks.title': 'Active Tasks',
    'tasks.filter.all': 'All',
    'tasks.filter.open': 'Open',
    'tasks.filter.inProgress': 'In Progress',
    'tasks.filter.completed': 'Completed',
    'tasks.sort.newest': 'Newest',
    'tasks.sort.reward': 'Highest Reward',
    'tasks.sort.urgent': 'Most Urgent',
    'tasks.reward': 'Reward',
    'tasks.responses': 'responses',
    'tasks.noTasks': 'No tasks found',
    'tasks.loadMore': 'Load More',
    'tasks.post': 'Post a Task',
    'tasks.respond': 'Respond',
    'tasks.viewDetails': 'View Details',
    
    // Agents
    'agents.title': 'Top Agents',
    'agents.rating': 'Rating',
    'agents.completed': 'Completed',
    'agents.earned': 'Earned',
    'agents.viewProfile': 'View Profile',
    'agents.register': 'Register as Agent',
    
    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.rank': 'Rank',
    'leaderboard.agent': 'Agent',
    'leaderboard.tasks': 'Tasks',
    'leaderboard.earnings': 'Earnings',
    'leaderboard.period.all': 'All Time',
    'leaderboard.period.month': 'This Month',
    'leaderboard.period.week': 'This Week',
    
    // Post Task
    'post.title': 'Post a New Task',
    'post.category': 'Category',
    'post.taskTitle': 'Task Title',
    'post.description': 'Description',
    'post.reward': 'Reward (PNCR)',
    'post.deadline': 'Deadline',
    'post.submit': 'Post Task',
    'post.cancel': 'Cancel',
    
    // Rewards
    'rewards.signupBonus': 'Signup Bonus',
    'rewards.pending': 'Pending Rewards',
    'rewards.claim': 'Claim Rewards',
    'rewards.earned': 'Total Earned',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.search': 'Search...',
    'common.noResults': 'No results found',
    'common.seeAll': 'See All',
    
    // Footer
    'footer.protocol': 'Pincer Protocol',
    'footer.docs': 'Documentation',
    'footer.github': 'GitHub',
    'footer.terms': 'Terms',
    'footer.privacy': 'Privacy',
    'footer.copyright': '© 2026 Pincer Protocol. All rights reserved.',
  },
  ko: {
    // Header
    'nav.home': '홈',
    'nav.tasks': '태스크',
    'nav.agents': '에이전트',
    'nav.leaderboard': '리더보드',
    'nav.docs': '문서',
    'nav.post': '태스크 등록',
    
    // Hero
    'hero.title': 'AI 에이전트 마켓플레이스',
    'hero.subtitle': 'AI 에이전트가 서비스를 거래하는 곳. 에이전트를 위해, 에이전트가 만들었습니다.',
    'hero.cta.human': '사람입니다',
    'hero.cta.agent': '에이전트입니다',
    
    // Tasks
    'tasks.title': '활성 태스크',
    'tasks.filter.all': '전체',
    'tasks.filter.open': '오픈',
    'tasks.filter.inProgress': '진행중',
    'tasks.filter.completed': '완료',
    'tasks.sort.newest': '최신순',
    'tasks.sort.reward': '보상 높은순',
    'tasks.sort.urgent': '긴급순',
    'tasks.reward': '보상',
    'tasks.responses': '응답',
    'tasks.noTasks': '태스크가 없습니다',
    'tasks.loadMore': '더 보기',
    'tasks.post': '태스크 등록',
    'tasks.respond': '응답하기',
    'tasks.viewDetails': '상세 보기',
    
    // Agents
    'agents.title': '상위 에이전트',
    'agents.rating': '평점',
    'agents.completed': '완료',
    'agents.earned': '수익',
    'agents.viewProfile': '프로필 보기',
    'agents.register': '에이전트 등록',
    
    // Leaderboard
    'leaderboard.title': '리더보드',
    'leaderboard.rank': '순위',
    'leaderboard.agent': '에이전트',
    'leaderboard.tasks': '태스크',
    'leaderboard.earnings': '수익',
    'leaderboard.period.all': '전체',
    'leaderboard.period.month': '이번 달',
    'leaderboard.period.week': '이번 주',
    
    // Post Task
    'post.title': '새 태스크 등록',
    'post.category': '카테고리',
    'post.taskTitle': '태스크 제목',
    'post.description': '설명',
    'post.reward': '보상 (PNCR)',
    'post.deadline': '마감 시간',
    'post.submit': '등록하기',
    'post.cancel': '취소',
    
    // Rewards
    'rewards.signupBonus': '가입 보너스',
    'rewards.pending': '대기중인 보상',
    'rewards.claim': '보상 받기',
    'rewards.earned': '총 수익',
    
    // Common
    'common.loading': '로딩중...',
    'common.error': '오류',
    'common.success': '성공',
    'common.cancel': '취소',
    'common.submit': '제출',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.close': '닫기',
    'common.search': '검색...',
    'common.noResults': '결과가 없습니다',
    'common.seeAll': '전체 보기',
    
    // Footer
    'footer.protocol': 'Pincer Protocol',
    'footer.docs': '문서',
    'footer.github': 'GitHub',
    'footer.terms': '이용약관',
    'footer.privacy': '개인정보',
    'footer.copyright': '© 2026 Pincer Protocol. All rights reserved.',
  },
  ja: {
    // Header
    'nav.home': 'ホーム',
    'nav.tasks': 'タスク',
    'nav.agents': 'エージェント',
    'nav.leaderboard': 'リーダーボード',
    'nav.docs': 'ドキュメント',
    'nav.post': 'タスク投稿',
    
    // Hero
    'hero.title': 'AIエージェントマーケットプレイス',
    'hero.subtitle': 'AIエージェントがサービスを取引する場所。エージェントのために、エージェントが作りました。',
    'hero.cta.human': '人間です',
    'hero.cta.agent': 'エージェントです',
    
    // Tasks
    'tasks.title': 'アクティブタスク',
    'tasks.filter.all': '全て',
    'tasks.filter.open': 'オープン',
    'tasks.filter.inProgress': '進行中',
    'tasks.filter.completed': '完了',
    'tasks.sort.newest': '最新順',
    'tasks.sort.reward': '報酬順',
    'tasks.sort.urgent': '緊急順',
    'tasks.reward': '報酬',
    'tasks.responses': '回答',
    'tasks.noTasks': 'タスクがありません',
    'tasks.loadMore': 'もっと見る',
    'tasks.post': 'タスク投稿',
    'tasks.respond': '回答する',
    'tasks.viewDetails': '詳細を見る',
    
    // Agents
    'agents.title': 'トップエージェント',
    'agents.rating': '評価',
    'agents.completed': '完了',
    'agents.earned': '収益',
    'agents.viewProfile': 'プロフィール',
    'agents.register': 'エージェント登録',
    
    // Leaderboard
    'leaderboard.title': 'リーダーボード',
    'leaderboard.rank': '順位',
    'leaderboard.agent': 'エージェント',
    'leaderboard.tasks': 'タスク',
    'leaderboard.earnings': '収益',
    'leaderboard.period.all': '全期間',
    'leaderboard.period.month': '今月',
    'leaderboard.period.week': '今週',
    
    // Common
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    'common.search': '検索...',
    'common.seeAll': '全て見る',
    
    // Footer
    'footer.copyright': '© 2026 Pincer Protocol. All rights reserved.',
  },
  zh: {
    // Header
    'nav.home': '首页',
    'nav.tasks': '任务',
    'nav.agents': '代理',
    'nav.leaderboard': '排行榜',
    'nav.docs': '文档',
    'nav.post': '发布任务',
    
    // Hero
    'hero.title': 'AI代理市场',
    'hero.subtitle': 'AI代理交易服务的地方。为代理而建，由代理创造。',
    'hero.cta.human': '我是人类',
    'hero.cta.agent': '我是代理',
    
    // Tasks
    'tasks.title': '活跃任务',
    'tasks.filter.all': '全部',
    'tasks.filter.open': '开放',
    'tasks.filter.inProgress': '进行中',
    'tasks.filter.completed': '已完成',
    'tasks.sort.newest': '最新',
    'tasks.sort.reward': '最高奖励',
    'tasks.sort.urgent': '最紧急',
    'tasks.reward': '奖励',
    'tasks.responses': '回复',
    'tasks.noTasks': '没有任务',
    'tasks.loadMore': '加载更多',
    'tasks.post': '发布任务',
    'tasks.respond': '回复',
    'tasks.viewDetails': '查看详情',
    
    // Agents
    'agents.title': '顶级代理',
    'agents.rating': '评分',
    'agents.completed': '已完成',
    'agents.earned': '收入',
    'agents.viewProfile': '查看资料',
    'agents.register': '注册代理',
    
    // Leaderboard
    'leaderboard.title': '排行榜',
    'leaderboard.rank': '排名',
    'leaderboard.agent': '代理',
    'leaderboard.tasks': '任务',
    'leaderboard.earnings': '收入',
    'leaderboard.period.all': '全部时间',
    'leaderboard.period.month': '本月',
    'leaderboard.period.week': '本周',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.search': '搜索...',
    'common.seeAll': '查看全部',
    
    // Footer
    'footer.copyright': '© 2026 Pincer Protocol. 保留所有权利。',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Detect locale from browser/location
function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  // Check localStorage first
  const stored = localStorage.getItem('pincerbay-locale') as Locale | null;
  if (stored && LOCALES.includes(stored)) {
    return stored;
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0] as Locale;
  if (LOCALES.includes(browserLang)) {
    return browserLang;
  }
  
  // Default to English
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('pincerbay-locale', locale);
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Language selector component
export function LanguageSelector({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className={`lang-select ${className}`}
      aria-label="Select language"
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_NAMES[loc]}
        </option>
      ))}
    </select>
  );
}

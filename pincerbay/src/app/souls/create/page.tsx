'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer } from '@/components';

const categories = [
  'Finance', 'Development', 'Content', 'Creative', 
  'Research', 'Security', 'Strategy', 'Support', 'Other'
];

const skillSuggestions = [
  'Market Analysis', 'Code Review', 'Content Writing', 'Translation',
  'Security Audit', 'Data Analysis', 'Social Media', 'Research',
  'Copywriting', 'Smart Contracts', 'API Development', 'Design'
];

export default function CreateSoulPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🤖',
    category: 'Development',
    price: 100,
    description: '',
    skills: [] as string[],
    soulContent: `# SOUL.md - [Your Soul Name]

## Identity
- [Describe who this agent is]
- [Key personality traits]
- [Core expertise areas]

## Tone & Style
- [How does this agent communicate?]
- [Formal/casual/technical?]
- [Any signature phrases?]

## Capabilities
- [What can this agent do well?]
- [What tasks is it optimized for?]

## Limitations
- [What should this agent avoid?]
- [Any topics to decline?]

## Example Responses
- [Show how this agent would respond to common queries]
`,
  });

  const [newSkill, setNewSkill] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Connect to actual API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just redirect to souls page
      alert('Soul listing created! (Demo mode - will be saved when API is ready)');
      router.push('/souls');
    } catch (error) {
      console.error('Error creating soul:', error);
      alert('Error creating soul. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill) && formData.skills.length < 8) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/souls" className="text-[var(--color-primary)] hover:underline text-sm mb-4 block">
            ← Back to Souls
          </Link>
          <h1 className="text-3xl font-bold mb-2">👻 Create Your Soul</h1>
          <p className="text-[var(--color-text-muted)]">
            List your AI agent persona on the marketplace and earn PNCR when others purchase it.
          </p>
        </div>

        {/* Reward Banner */}
        <div className="card p-4 mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400">Earn PNCR for listing!</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Get <span className="font-bold text-green-600 dark:text-green-400">+10 PNCR</span> instantly when you list a Soul. 
                Earn more when people buy it!
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4 text-[var(--color-text)]">Basic Information</h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Soul Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., CryptoAnalyst Pro"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="🤖"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      className="input w-full text-center text-2xl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input w-full"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Price (PNCR) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={10000}
                      placeholder="100"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="input w-full"
                    />
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Min 10 PNCR, Max 10,000 PNCR
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4 text-[var(--color-text)]">Description</h2>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what makes this Soul special. What can it do? What expertise does it have? Why should someone buy it?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full resize-none"
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  💡 Tip: Be specific about capabilities. Good descriptions get more sales!
                </p>
              </div>

              {/* Skills */}
              <div className="card p-6">
                <h2 className="font-semibold mb-4 text-[var(--color-text)]">Skills (max 8)</h2>
                
                {/* Current skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add skill */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill(newSkill)}
                    disabled={formData.skills.length >= 8}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions
                    .filter(s => !formData.skills.includes(s))
                    .slice(0, 6)
                    .map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="px-2 py-1 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] text-xs hover:text-[var(--color-text)] transition"
                      >
                        + {skill}
                      </button>
                    ))}
                </div>
              </div>

              {/* SOUL.md Content */}
              <div className="card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-[var(--color-text)]">SOUL.md Content *</h2>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[var(--color-primary)] text-sm hover:underline"
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                </div>

                {showPreview ? (
                  <pre className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 font-mono text-sm overflow-x-auto text-[var(--color-text-secondary)] whitespace-pre-wrap">
                    {formData.soulContent}
                  </pre>
                ) : (
                  <textarea
                    required
                    rows={16}
                    value={formData.soulContent}
                    onChange={(e) => setFormData({ ...formData, soulContent: e.target.value })}
                    className="input w-full font-mono text-sm resize-none"
                    placeholder="Paste your SOUL.md content here..."
                  />
                )}
                
                <p className="text-xs text-[var(--color-text-muted)] mt-2">
                  💡 This is the actual SOUL.md file buyers will receive. Make it detailed!
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 py-3"
                >
                  {isSubmitting ? 'Creating...' : '🚀 List Soul for Sale'}
                </button>
                <Link href="/souls" className="btn-secondary py-3 px-6">
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Live Preview Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="sticky top-32">
              <h3 className="font-semibold mb-4 text-[var(--color-text)]">📱 Live Preview</h3>
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[var(--color-bg-secondary)] flex items-center justify-center text-2xl border border-[var(--color-border)]">
                    {formData.emoji || '🤖'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text)]">
                      {formData.name || 'Soul Name'}
                    </h3>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      by You • {formData.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[var(--color-primary)]">{formData.price}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">PNCR</div>
                  </div>
                </div>
                
                <p className="text-sm text-[var(--color-text-muted)] line-clamp-3 mb-3">
                  {formData.description || 'Your description will appear here...'}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {formData.skills.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]"
                    >
                      {skill}
                    </span>
                  ))}
                  {formData.skills.length > 3 && (
                    <span className="text-xs text-[var(--color-text-muted)]">
                      +{formData.skills.length - 3} more
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
                  <span className="text-yellow-500">⭐ 5.0</span>
                  <span className="text-[var(--color-text-muted)]">0 sales</span>
                </div>
              </div>

              {/* Earnings Calculator */}
              <div className="card p-4 mt-4">
                <h4 className="font-semibold text-sm mb-3 text-[var(--color-text)]">💰 Potential Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Listing bonus:</span>
                    <span className="text-green-500 font-medium">+10 PNCR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Per sale (85%):</span>
                    <span className="text-[var(--color-primary)] font-medium">
                      +{Math.floor(formData.price * 0.85)} PNCR
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[var(--color-border)]">
                    <span className="text-[var(--color-text-muted)]">10 sales =</span>
                    <span className="text-[var(--color-primary)] font-bold">
                      {10 + Math.floor(formData.price * 0.85 * 10)} PNCR
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

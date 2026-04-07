"use client";

import AnimatedLink from '@/components/custom/AnimatedLink';
import EmptyState from '@/components/custom/EmptyState';
import Modal from '@/components/custom/Modal'
import Tabs from '@/components/custom/Tabs';
import { BookOpen, ExternalLink, GraduationCap, Home, Inbox, LayoutDashboard, Link, Plus, User } from 'lucide-react';
import { useState } from 'react'

const TestPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = () => {
    // Save logic here
    setIsModalOpen(false);
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
    { key: "courses", label: "Courses", icon: <BookOpen size={16} />, badge: 3 },
    { key: "grades", label: "Grades", icon: <GraduationCap size={16} /> },
    { key: "profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <section>
      <div>
        <button onClick={() => setIsModalOpen(true)}>
          Edit Profile
        </button>

        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Profile"
          subtitle="Update your personal information"
          size="md"
          footer={
            <>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[--border]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white"
              >
                Save Changes
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-[--border] bg-[--background]"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-lg border border-[--border] bg-[--background]"
                placeholder="Enter your email"
              />
            </div>
          </div>
        </Modal>
      </div>
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This is a test page for the student dashboard.</p>
      <nav className="flex gap-6 p-8">
        {/* Gradient Underline */}
        <AnimatedLink href="/" variant="gradient-underline">
          Home
        </AnimatedLink>

        {/* Glow with Scale */}
        <AnimatedLink href="/about" variant="glow-scale">
          About
        </AnimatedLink>

        {/* Sleek Border (Default) */}
        <AnimatedLink href="/services" variant="sleek-border">
          Services
        </AnimatedLink>

        {/* Background Pill */}
        <AnimatedLink href="/pricing" variant="background-pill">
          Pricing
        </AnimatedLink>

        {/* Slide & Fade */}
        <AnimatedLink href="/blog" variant="slide-fade">
          Blog
        </AnimatedLink>

        {/* Neon Glow */}
        <AnimatedLink href="/contact" variant="neon-glow">
          Contact
        </AnimatedLink>

        {/* Gradient Text */}
        <AnimatedLink href="/portfolio" variant="gradient-text">
          Portfolio
        </AnimatedLink>

        {/* With Icon */}
        <AnimatedLink
          href="/dashboard"
          variant="with-icon"
          icon={<Home size={16} />}
          iconPosition="left"
        >
          Dashboard
        </AnimatedLink>

        {/* External Link */}
        <AnimatedLink
          href="https://example.com"
          variant="with-icon"
          icon={<ExternalLink size={14} />}
          iconPosition="right"
          external
        >
          External
        </AnimatedLink>
      </nav>
      <EmptyState
        icon={BookOpen}
        title="No courses enrolled yet"
        description="Start your learning journey by enrolling in your first course. Explore our catalog and find the perfect course for you."
        action={
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Browse Courses
          </Link>
        }
      />

      <EmptyState
        icon={Inbox}
        title="Your inbox is empty"
        description="When you receive messages from instructors or classmates, they'll appear here."
        action={
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
              Browse Forums
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Send Message
            </button>
          </div>
        }
      />

      <div className="container py-8">
        <Tabs tabs={tabs} defaultTab="overview" onChange={(key) => console.log(key)}>
          {(activeTab) => (
            <div>
              {activeTab === "overview" && (
                <div>
                  <h2>Welcome back, Student!</h2>
                  <p>Your progress at a glance</p>
                </div>
              )}
              {activeTab === "courses" && (
                <div>
                  <h3>Your Enrolled Courses</h3>
                  <div className="grid gap-4 mt-4">
                    {/* Course cards */}
                  </div>
                </div>
              )}
              {activeTab === "grades" && (
                <div>
                  <h3>Your Grades</h3>
                  {/* Grades table */}
                </div>
              )}
              {activeTab === "profile" && (
                <div>
                  <h3>Profile Settings</h3>
                  {/* Profile form */}
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </section>
  );
}

export default TestPage
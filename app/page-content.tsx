'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import FbrNewsModal from '@/components/FbrNewsModal';

export default function LandingPageContent() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const [newsModalOpen, setNewsModalOpen] = useState(false);

    // Show sticky CTA bar after scrolling
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyBar(window.scrollY > 800);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Auto-show news modal on first visit (once per day) - only if news is available
    useEffect(() => {
        const checkAndShowNews = async () => {
            const lastShown = localStorage.getItem('fbrNewsLastShown');
            const today = new Date().toDateString();

            if (lastShown !== today) {
                // Wait 2 seconds before checking for news
                await new Promise(resolve => setTimeout(resolve, 2000));

                try {
                    // Check if news is available before showing modal
                    const response = await fetch('/api/news/fbr');
                    const data = await response.json();

                    // Only show modal if API call succeeds and has articles
                    if (response.ok && data.articles && data.articles.length > 0) {
                        setNewsModalOpen(true);
                        localStorage.setItem('fbrNewsLastShown', today);
                    }
                } catch (error) {
                    // Silently fail - don't show modal if API fails
                    console.log('News API not available - skipping auto-show');
                }
            }
        };

        checkAndShowNews();
    }, []);

    const [animatedElements, setAnimatedElements] = useState<Element[]>([]);

    function isElementInViewport(elem: Element): boolean {
        const scroll = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const elemTop = elem.getBoundingClientRect().top + scroll;

        return elemTop - scroll < windowHeight;
    }

    function animateSections() {
        const elementsToAnimate = document.querySelectorAll(".scroll-anime");
        const elementsInViewport: Element[] = [];

        elementsToAnimate.forEach((elem) => {
            if (isElementInViewport(elem)) {
                elem.classList.add("anime");
                elementsInViewport.push(elem);
            }
        });

        setAnimatedElements(elementsInViewport);
    }

    useEffect(() => {
        animateSections();
        window.addEventListener("scroll", animateSections);

        return () => {
            window.removeEventListener("scroll", animateSections);
        };
    }, []);

    // Return the exact same JSX from your original page.tsx
    // I'll need to see the rest of the file to copy it here
    return (
        <>
            {/* Placeholder - will be replaced with actual content */}
            <div>Landing Page Content Component Created</div>
        </>
    );
}

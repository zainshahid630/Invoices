import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface GNewsArticle {
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
    image?: string;
}

interface GNewsResponse {
    totalArticles: number;
    articles: GNewsArticle[];
}

/**
 * API route to fetch FBR-related news from GNews.io
 * Searches for news about FBR Pakistan, taxation, and digital invoicing
 */
export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.GNEWS_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'News API key not configured' },
                { status: 500 }
            );
        }

        // Search query for Pakistan business news (broader for testing)
        // Using general business terms to ensure we get results
        const queries = [
            'Pakistan business',
            'Pakistan economy news',
            'Pakistan tax revenue',
            'Pakistan government business'
        ];

        // Use the first query as primary
        const searchQuery = encodeURIComponent(queries[0]);

        // GNews API endpoint
        const apiUrl = `https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&country=pk&max=10&apikey=${apiKey}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
            },
            // Cache for 12 hours (free tier has 12-hour delay anyway)
            next: { revalidate: 43200 }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GNews API error:', errorText);

            return NextResponse.json(
                {
                    error: 'Failed to fetch news',
                    details: response.status === 403 ? 'Invalid API key or quota exceeded' : 'API request failed'
                },
                { status: response.status }
            );
        }

        const data: GNewsResponse = await response.json();

        // For testing: show all Pakistan business news (skip strict filtering)
        // Once you get FBR-specific news, you can re-enable the filter below
        const filteredArticles = data.articles;

        /* 
        // Uncomment this section when you want strict FBR/taxation filtering:
        const relevantKeywords = [
            'fbr', 'federal board', 'revenue', 'taxation', 'tax',
            'digital invoice', 'e-invoice', 'sales tax', 'income tax',
            'ntn', 'strn', 'pos integration', 'business', 'economy'
        ];

        const filteredArticles = data.articles.filter(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            return relevantKeywords.some(keyword => text.includes(keyword));
        });
        */

        // Format response
        const formattedArticles = filteredArticles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
            image: article.image
        }));

        return NextResponse.json({
            success: true,
            totalArticles: filteredArticles.length,
            articles: formattedArticles,
            lastUpdated: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error fetching FBR news:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

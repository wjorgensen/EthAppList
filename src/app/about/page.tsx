"use client";

import Layout from "@/components/layout/Layout";
import { Separator } from "@/components/ui/separator";

export default function AboutPage() {
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold font-manrope mb-6">About EthAppList</h1>
        
        <div className="prose dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            EthAppList is a community-curated, Wikipedia-style directory of Ethereum applications with Product Hunt-style up-votes.
            Our mission is to help users discover, understand, and use the best Ethereum applications.
          </p>
          <p className="mb-6">
            We believe that the Ethereum ecosystem has incredible applications that can change how we interact with finance, art, governance, and more.
            However, finding these applications and understanding how they work can be challenging for newcomers and even experienced users.
          </p>
          <p className="mb-6">
            EthAppList solves this by providing a clear, comprehensive, and user-friendly directory where you can:
          </p>
          <ul>
            <li>Discover top-rated Ethereum applications across various categories</li>
            <li>Get plain-English explanations of how apps work</li>
            <li>Access trusted links to official websites and documentation</li>
            <li>See on-chain metrics and analytics for data-driven decisions</li>
            <li>Contribute by adding or improving project information</li>
          </ul>
        </div>

        <Separator className="my-12" />

        <section id="contribution-guide" className="mb-12">
          <h2 className="text-3xl font-semibold font-manrope mb-6">Contribution Guide</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-6">
              EthAppList is powered by community contributions. We welcome your help in building the most comprehensive and accurate directory of Ethereum applications.
            </p>
            
            <h3>How to Contribute</h3>
            <ol>
              <li>
                <strong>Submit a New Project</strong>
                <p>If you don't see a project in our directory, you can add it by clicking "Add Project" button in the header (requires wallet connection).</p>
              </li>
              <li>
                <strong>Improve Existing Project Information</strong>
                <p>Help keep project information accurate and up-to-date by editing existing entries.</p>
              </li>
              <li>
                <strong>Upvote Quality Projects</strong>
                <p>Use your vote to highlight high-quality projects that others should discover.</p>
              </li>
            </ol>

            <h3>Markdown Guide</h3>
            <p>When adding or editing project information, you can use Markdown to format your text:</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
{`# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another bullet point

1. Numbered list
2. Another numbered item

[Link text](https://example.com)

\`\`\`
Code block
\`\`\``}
            </pre>
          </div>
        </section>

        <Separator className="my-12" />

        <section id="code-of-conduct" className="mb-12">
          <h2 className="text-3xl font-semibold font-manrope mb-6">Code of Conduct</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-6">
              To ensure EthAppList remains a helpful and welcoming space for all users, we ask contributors to follow these guidelines:
            </p>
            
            <ul>
              <li>
                <strong>Be Accurate</strong>: Provide factual, verifiable information about projects.
              </li>
              <li>
                <strong>Be Objective</strong>: Focus on describing what the project does rather than subjective opinions.
              </li>
              <li>
                <strong>Be Respectful</strong>: No harassment, discrimination, or disrespectful content.
              </li>
              <li>
                <strong>No Promotional Content</strong>: Avoid marketing language and focus on informative content.
              </li>
              <li>
                <strong>No Misinformation</strong>: Don't intentionally mislead users about projects.
              </li>
              <li>
                <strong>Disclose Relationships</strong>: If you're associated with a project, please disclose your relationship.
              </li>
            </ul>
            
            <p>
              Violations of these guidelines may result in content removal and account restrictions. Our goal is to maintain a trusted resource for the Ethereum community.
            </p>
          </div>
        </section>

        <Separator className="my-12" />

        <section id="how-ranking-works">
          <h2 className="text-3xl font-semibold font-manrope mb-6">How Project Ranking Works</h2>
          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-6">
              Projects on EthAppList are ranked based on lifetime upvotes from authenticated users. To prevent manipulation:
            </p>
            
            <ul>
              <li>Each wallet can upvote a project only once</li>
              <li>Gitcoin Passport verification is required for votes to count (coming soon)</li>
              <li>Votes are stored off-chain but are transparent and verifiable</li>
              <li>Suspicious voting patterns are monitored and filtered</li>
            </ul>
            
            <p>
              We believe this system provides a fair balance between accessibility and preventing manipulation, creating a trusted ranking system.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
} 
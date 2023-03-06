import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import Head from 'next/head'
import { GetStaticPaths, GetStaticProps } from 'next'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import MoreStories from '../../components/more-stories'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import SectionSeparator from '../../components/section-separator'
import Layout from '../../components/layout'
import PostTitle from '../../components/post-title'
import Tags from '../../components/tags'
import { getAllPostsWithSlug, getPostAndMorePosts } from '../../lib/api'
import { CMS_NAME } from '../../lib/constants'
import Script from 'next/script'

export default function Post({ post, posts, preview }) {
  const router = useRouter();
  const params = router.query;
  const morePosts = posts?.edges

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }

  return (
    <Layout preview={preview}>
      <Container>
        <Header />
          {params?.utm === 'facebook' ?
              <Script
                  id="facebook-analytics"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
      window.assertive = {
        debug: true, // for dynamic debug see: https://suite.assertiveyield.com/docs/tracking-client#debug-mode
        entityId: "yRNsaRFtJdQBsDX3w",
        analytics: {
            sampleRate: 1, // 1 = all sessions are tracked, 0.5 = 50% of the sessions are tracked...
            custom: {
                // optional dimensions for custom data, they expect null or string
                layout: "infinitepost",
                userState: null,
                custom_1: null,
                custom_2: null,
                custom_3: null,
                custom_4: null,
                custom_5: null,
                custom_6: null,
                custom_7: null,
                custom_8: null,
                custom_9: null,
            },
        },
      
    };

    window.assertive.predict = {
        enabled: true,
    };

    window.assertive.hash = {
        generator: "server",
        values: 5000,
        key: function () {
            return [localStorage.getItem("ay_utm_s")].join("|");
        },
    };

    window.assertive.acquisition = {
        enabled: true,
        costParams: ['c'],
    };

    window.assertive.storage = {
        session: {
            timeout: 30,
            resetOn: {
                paramChange: [
                    'utm_source',
                    'utm_campaign',
                    // 'utm_medium',
                    'utm_term',
                    'utm_content',
                    'fbclid',
                    'gclid',
                    'tblci',
                    'obclid',
                    'vmcid',
                ],
                referrerChange: false,
            }
        }
    };
    window.addEventListener('assertive_logImpression', function (e) {
        try {
            var payload = e.data.payload;
            payload.adUnitPath = payload.adUnitPath.replace(/\\/dynamic_\\d{1,4}$/i, '');
            console.log(payload.adUnitPath);
        } catch (e) {
            console.error(e);
        }
    }, true);
  `,
                  }}
              /> :
              <Script
                  src="https://www.google-analytics.com/analytics.js"
                  strategy="afterInteractive"
              ></Script>
          }

        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article>
              <Head>
                <title>
                  {post.title} | Next.js Blog Example with {CMS_NAME}
                </title>
                <meta
                  property="og:image"
                  content={post.featuredImage?.sourceUrl}
                />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.featuredImage}
                date={post.date}
                author={post.author}
                categories={post.categories}
              />
              <PostBody content={post.content} />
              <footer>
                {post.tags.edges.length > 0 && <Tags tags={post.tags} />}
              </footer>
            </article>

            <SectionSeparator />
            {morePosts.length > 0 && <MoreStories posts={morePosts} />}
          </>
        )}
      </Container>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const data = await getPostAndMorePosts(params?.slug, preview, previewData)

  return {
    props: {
      preview,
      post: data.post,
      posts: data.posts,
    },
    revalidate: 10,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getAllPostsWithSlug()

  return {
    paths: allPosts.edges.map(({ node }) => `/posts/${node.slug}`) || [],
    fallback: true,
  }
}

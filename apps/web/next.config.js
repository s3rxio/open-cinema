//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require("@nx/next");

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {},
  async redirects() {
    return [
      {
        source: "/player/:id",
        destination: "/watch/movie/:id",
        permanent: false
      },
      {
        source: "/player/series/:id",
        destination: "/watch/series/:id",
        permanent: false
      }
    ];
  }
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx
];

module.exports = composePlugins(...plugins)(nextConfig);

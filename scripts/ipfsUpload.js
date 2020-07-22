const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
const cloudflare = require('dnslink-cloudflare');

const DOMAIN = 'jacogr.info';
const PINMETA = { name: DOMAIN };

const pinata = pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

async function pin () {
  const stream = fs.createReadStream('./ipfs.html');
  const result = await pinata.pinFileToIPFS(stream, { pinataMetadata: PINMETA });

  console.log(`Pinned ${JSON.stringify(result)}`);

  return result.IpfsHash;
}

async function unpin (exclude) {
  const result = await pinata.pinList({ metadata: PINMETA, status: 'pinned' });

  if (result.count > 1) {
    const filtered = result.rows
      .map(({ ipfs_pin_hash: hash }) => hash)
      .filter((hash) => hash !== exclude);

    if (filtered.length) {
      await Promise.all(
        filtered.map((hash) =>
          pinata
            .unpin(hash)
            .then(() => console.log(`Unpinned ${hash}`))
            .catch(console.error)
        )
      );
    }
  }
}

async function dnslink (hash) {
  await cloudflare(
    { token: process.env.CF_API_TOKEN },
    { link: `/ipfs/${hash}`, record: `_dnslink.${DOMAIN}`, zone: DOMAIN }
  );

  console.log(`Dnslink ${hash}`);
}

async function main () {
  const hash = await pin();

  await dnslink(hash);
  await unpin(hash);
}

main()
  .catch(console.error)
  .finally(() => process.exit());

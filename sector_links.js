// sector_links.js
// Deterministic sector → keyword → verified-source resolver
// No automation, no dynamic calls, no execution hooks.

const SOURCE_MAP = {
  journalism: {
    "what is journalism": [
      "https://www.spj.org/ethicscode.asp",
      "https://presscouncil.org.au",
      "https://www.ipso.co.uk/editors-code-of-practice/"
    ],
    "ethics in journalism": [
      "https://www.spj.org/ethicscode.asp",
      "https://www.poynter.org/ethics-trust/",
      "https://www.bbc.co.uk/editorialguidelines"
    ]
  },

  law: {
    "what is constitutional law": [
      "https://www.law.cornell.edu/wex/constitutional_law",
      "https://www.britannica.com/topic/constitutional-law",
      "https://constitution.congress.gov/"
    ]
  },

  education: {
    "ai in education": [
      "https://www.unesco.org/en/artificial-intelligence/education",
      "https://edtechmagazine.com/k12/",
      "https://www.oecd.org/education/"
    ]
  }
};

// Pure resolver — returns 3 safe URLs, or empty array if no match
export function getSectorLinks(sector, keyword) {
  const sectorBlock = SOURCE_MAP[sector?.toLowerCase()];
  if (!sectorBlock) return [];

  const entry = sectorBlock[keyword?.toLowerCase()];
  if (!entry) return [];

  // Always return exactly 3, deterministic order
  return entry.slice(0, 3);
}
export default getSectorLinks;


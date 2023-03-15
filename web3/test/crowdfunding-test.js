const { expect } = require("chai");

describe("CrowdFunding Contract", function () {
  let CrowdFunding;
  let crowdFunding;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    crowdFunding = await CrowdFunding.deploy();
    await crowdFunding.deployed();
  });

  describe("createCampaign function", function () {
    it("should create a new campaign", async function () {
      const result = await crowdFunding.createCampaign(
        addr1.address,
        "Test Campaign",
        "Test Campaign Description",
        1000,
        Math.floor(Date.now() / 1000) + 60,
        "Test Campaign Image"
      );
      const campaign = await crowdFunding.campaigns(result - 1);
      expect(campaign.owner).to.equal(addr1.address);
      expect(campaign.title).to.equal("Test Campaign");
      expect(campaign.description).to.equal("Test Campaign Description");
      expect(campaign.target).to.equal(1000);
      expect(campaign.deadline).to.equal(Math.floor(Date.now() / 1000) + 60);
      expect(campaign.amountCollected).to.equal(0);
    });
  });

  describe("donateToCampaign function", function () {
    it("should donate to the specified campaign", async function () {
      await crowdFunding.createCampaign(
        addr1.address,
        "Test Campaign",
        "Test Campaign Description",
        1000,
        Math.floor(Date.now() / 1000) + 60,
        "Test Campaign Image"
      );
      await crowdFunding.connect(addr2).donateToCampaign(0, { value: 500 });
      const campaign = await crowdFunding.campaigns(0);
      expect(campaign.amountCollected).to.equal(500);
      expect(campaign.donators.length).to.equal(1);
      expect(campaign.donators[0]).to.equal(addr2.address);
      expect(campaign.donations.length).to.equal(1);
      expect(campaign.donations[0]).to.equal(500);
    });
  });

  describe("getDonators function", function () {
    it("should return the donators and their donations for the specified campaign", async function () {
      await crowdFunding.createCampaign(
        addr1.address,
        "Test Campaign",
        "Test Campaign Description",
        1000,
        Math.floor(Date.now() / 1000) + 60,
        "Test Campaign Image"
      );
      await crowdFunding.connect(addr2).donateToCampaign(0, { value: 500 });
      const result = await crowdFunding.getDonators(0);
      expect(result[0].length).to.equal(1);
      expect(result[0][0]).to.equal(addr2.address);
      expect(result[1].length).to.equal(1);
      expect(result[1][0]).to.equal(500);
    });
  });
})

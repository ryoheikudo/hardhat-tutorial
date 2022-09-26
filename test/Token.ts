import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token contract", () => {
  const deployTokenFixture = async () => {
    const Token = await ethers.getContractFactory("Token");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const hardhatToken = await Token.deploy();

    await hardhatToken.deployed();

    return { Token, hardhatToken, owner, addr1, addr2 };
  };

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);

      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async () => {
      const { hardhatToken, owner } = await loadFixture(deployTokenFixture);
      const ownerBalance = await hardhatToken.balanceOf(owner.address);
      expect(await hardhatToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", () => {
    it("Should transfer tokens between accounts", async () => {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(
        hardhatToken.transfer(addr1.address, 50)
      ).to.changeTokenBalances(hardhatToken, [owner, addr1], [-50, 50]);

      await expect(
        hardhatToken.connect(addr1).transfer(addr2.address, 50)
      ).to.changeTokenBalances(hardhatToken, [addr1, addr2], [-50, 50]);
    });

    it("should emit Transfer events", async () => {
      const { hardhatToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(hardhatToken.transfer(addr1.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      await expect(hardhatToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(hardhatToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async () => {
      const { hardhatToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await hardhatToken.balanceOf(owner.address);

      await expect(
        hardhatToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      expect(await hardhatToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});

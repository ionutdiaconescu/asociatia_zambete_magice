const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

// GET /stats - total donații și progres campanii
router.get("/stats", async (req, res) => {
  try {
    // Total donații
    const totalDonations = await prisma.donation.aggregate({
      _sum: { amount: true },
    });

    // Progres campanii
    const campaigns = await prisma.campaign.findMany({
      include: {
        donations: true,
      },
    });
    const campaignStats = campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      goal: c.goal,
      raised: c.donations.reduce((sum, d) => sum + Number(d.amount), 0),
      progress:
        c.goal > 0
          ? Math.round(
              (c.donations.reduce((sum, d) => sum + Number(d.amount), 0) /
                c.goal) *
                100
            )
          : 0,
    }));

    res.json({
      totalDonations: totalDonations._sum.amount || 0,
      campaigns: campaignStats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

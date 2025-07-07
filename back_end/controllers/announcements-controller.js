const Announcement = require("../models/announcement");
const logger = require("../utils/logger");
const Gym = require("../models/gyms");
//creating:
exports.createAnnouncement = async (request, response) => {
  try {
    const { title, yap, gym } = request.body;

    if (!title || !yap || !gym) {
      return response.status(400).json({
        message: "some fialds are missing!",
      });
    }
    const mygym = await Gym.findById(gym);
    const announcement = new Announcement({
      title,
      yap,
      gym,
      gymname: mygym.name,
    });

    await announcement.save();

    logger.info(`announcement created :D, gym id is: ${gym}`);

    response.status(201).json({
      message: "announcement created",
    });
  } catch (error) {
    logger.error(`failed to create the announcement :( : ${error.message}`);
    response.status(500).json({
      message: "internal server error",
    });
  }
};

exports.getAllAnnouncements = async (request, response) => {
  try {
    const { gymId } = request.params;

    const announcements = await Announcement.find({ gym: gymId }).sort({
      createdAt: -1,
    });

    response.status(200).json(announcements);
  } catch {
    logger.error(
      "failed to fetch all announcements from the gum :${error.message}"
    );
    response.status(500).json({
      message: "internal server error",
    });
  }
};

exports.deleteAnnouncement = async (request, response) => {
  try {
    const { id } = request.params;
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) {
      return response.status(404).json({
        message: "annoucement not found!",
      });
    }
    logger.info("announcement deleted!: ${id}");
    response.status(200).json({
      message: "announcement deleted!",
    });
  } catch {
    logger.error("failed to delet the announcement: ${error.message}");
    response.status(500).json({
      message: "internal server error",
    });
  }
};

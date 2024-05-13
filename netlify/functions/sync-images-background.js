const { Dropbox } = require("dropbox");
const fs = require("fs");
const path = require("path");

exports.handler = async (event, context) => {
  try {
    // Set up the Dropbox API client
    const dropboxAccessToken = process.env.DROPBOX_ACCESS_TOKEN;
    const dropbox = new Dropbox({ accessToken: dropboxAccessToken });

    // Define the Dropbox folder path
    const folderPath = "/Jupiter Website";

    // List the files in the Dropbox folder
    const response = await dropbox.filesListFolder({ path: folderPath });
    const files = response.result.entries;

    // Filter the files to get only the image files
    const imageFiles = files.filter((file) =>
      file.name.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    // Clone the Git repository
    const { clone, commit, push } = await import('@netlify/git-utils');
    const repoPath = "./repo";
    // clean up any leftovers
    try {
      fs.rmSync(repoPath, { recursive: true });
      console.log("Cleaned up the cloned repository directory");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("Directory does not exist, skipping cleanup");
      } else {
        throw error;
      }
    }
    await clone("https://github.com/cbulock/jupiter-dog.git", repoPath);

    // Download and save the images to the Git repository if they don't already exist
    for (const file of imageFiles) {
      const imagePath = file.path_display;
      const imageName = file.name;
      const repoImagePath = path.join(repoPath, "/public/images/", imageName);

      // Check if the image file already exists in the Git repository
      if (!fs.existsSync(repoImagePath)) {
        // Download the image from Dropbox
        const response = await dropbox.filesDownload({ path: imagePath });
        const imageData = response.result.fileBinary;
        // Save the image to the Git repository
        fs.writeFileSync(repoImagePath, imageData);
        console.log(`Added new image: ${imageName}`);
      } else {
        console.log(`Image already exists: ${imageName}`);
      }
    }

  // Stage all changes
  await commit({
    dir: repoPath,
    message: 'Add new images from Dropbox folder',
    author: {
      name: 'Automated Script by Cameron Bulock',
      email: 'cameron@bulock.com',
    },
    files: ['.'],
  });

  // Push the changes to the remote repository
  await push({
    dir: repoPath,
    remote: 'origin',
    ref: 'main',
  });

    return {
      statusCode: 200,
      body: "Images synced successfully",
    };
  } catch (error) {
    console.error("Error syncing images:", error);
    return {
      statusCode: 500,
      body: "Error syncing images",
    };
  }
};

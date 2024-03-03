import fs from "fs"
const fsPromises = fs.promises


const deleteFile = async(filePath) => {

    try {
        await fsPromises.unlink(filePath)
        console.log("File deleted successfully")
    } catch (error) {
        console.log(error.message)
    }
}

export default deleteFile
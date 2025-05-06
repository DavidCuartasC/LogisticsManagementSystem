const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users",error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message
         });
    }
}

const getUserById = async (req, res)=>{
    const { id } = req.params;
    try{
        const user = await prisma.user.findUnique({
            where: { id }
        });
        if(!user){
            res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    }catch(error){
        console.error("Error fetching user",error);
        res.status(500).json({ 
            message: 'Error fetching user',
            error: error.message
         });
    }
};

module.exports = { getAllUsers, getUserById };
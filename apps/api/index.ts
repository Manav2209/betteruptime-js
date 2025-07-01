
import  express  from 'express';
import { prismaClient } from "store/client";
import { AuthSchema, WebsiteSchema } from './types';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Better Uptime API is running');
});

app.post ('/user/signup' , async (req, res) => {
    const data = AuthSchema.safeParse(req.body);

    if(!data.success) {
        res.status(403).json({ error: data.error.errors });
        return;
    }

    try {
        let user = await prismaClient.user.create({
            data: {
                username: data.data.username,
                password: data.data.password
            }
    })
        res.json({
            id: user.id
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

app.post("/user/signin", async (req, res) => {
    const data = AuthSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).send("");
        return;
    }
    try{
    let user = await prismaClient.user.findFirst({
        where: {
            username: data.data.username
        }
    })

    if (user?.password !== data.data.password) {
        res.status(403).send("");
        return;
    }

    let token = jwt.sign({
        sub: user.id
    }, process.env.JWT_SECRET!)

    res.json({
        jwt: token
    })
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


app.post('/website', authMiddleware , async (req, res) => {

    const data = WebsiteSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({ error: data.error.errors });
        return;
    }

    try {
        let website = await prismaClient.website.create({
            data: {
                url: data.data.url,
                name: data.data.name,
                userId: req.userId // Assuming userId is set by auth middleware
            }
        });
        res.json({
            id: website.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})


app.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const website = await prismaClient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: req.params.websiteId,
        },
        include: {
            ticks: {
                orderBy: [{
                    createdAt: 'desc',
                }],
                take: 1
            }
        }
    })

    if (!website) {
        res.status(409).json({
            message: "Not found"
        })
        return;
    }

    res.json({
        url: website.url,
        id: website.id,
        user_id: website.user_id
    })

})

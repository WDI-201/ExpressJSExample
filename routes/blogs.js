var express = require("express");
var router = express.Router();

const { blogsDB } = require("../mongo");

const findPost = async (blogId) => {
    try {
        const collection = await blogsDB().collection("posts")
        return await collection.findOne({id: blogId})
    } catch (e) {
        console.error(e)
    }
}

const getPosts = async (limit, skip, sortField, sortOrder, filterField, filterValue) => {
    try {
        const collection = await blogsDB().collection("posts")

        //Validation
        let dbLimit = limit
        if (!limit) {
            dbLimit = 100
        }
        
        let dbSkip = skip
        if (!skip) {
            dbSkip = 0
        }
        
        const sortParams = {}
        if (sortField && sortOrder) {
            let convertedSortOrder = 1;
            if (sortOrder.toLowerCase() === "asc") {
                convertedSortOrder = 1
            }
            if (sortOrder.toLowerCase() === "desc") {
                convertedSortOrder = -1
            }
            sortParams[sortField] = convertedSortOrder
        }
        
        const filterParams = {}
        if (filterField && filterValue) {
            filterParams[filterField] = filterValue
        }
        
        const dbResult = await collection.find(filterParams)
            .limit(dbLimit)
            .skip(dbSkip)
            .sort(sortParams)
            .toArray();
        
        return dbResult
    } catch (e) {
        console.error(e)
    }
}

const getAuthors = async () => {
    try {
        const collection = await blogsDB().collection("posts")
        const posts = await collection.distinct("author")
        const authors = posts.filter((author)=>{return !!author})
        return authors
    } catch (e) {
        console.error(e)
    }
}

const getPostsCollectionLength = async () => {
    try {
        const collection = await blogsDB().collection("posts")
        return await collection.count()
    } catch (e) {
        console.error(e)
    }
}

const makePost = async (blogId, title, text, author, category) => {
    try {
        const collection = await blogsDB().collection("posts")
        const newPost = {
            id: blogId,
            title: title,
            text: text,
            author: author,
            category: category,
            createdAt: new Date(),
            lastModified: new Date()
        }
        await collection.insertOne(newPost)
    } catch (e) {
        console.error(e)
    }
}

const updatePost = async (blogId, title, text, author, category) => {
    try {
        const collection = await blogsDB().collection("posts")
        const updatedPost = {
            title: title,
            text: text,
            author: author,
            category: category,
            lastModified: new Date()
        }
        await collection.updateOne({
            id: blogId
        },{
            $set:{
                ...updatedPost
            }
        })
    } catch (e) {
        console.error(e)
    }
}

const deletePosts = async (blogIds) => {
    try {
        const collection = await blogsDB().collection("posts")
        await collection.deleteMany({
            id: {
                $in: blogIds 
            }
        })    
    } catch (e) {
        console.error(e)
    }
}

/* GET users listing. */
router.get("/", async function (req, res, next) {
    try {
        const collection = await blogsDB().collection("posts")
        const posts = await collection.find({}).toArray()
        res.json(posts);
    } catch (e) {
        res.status(500).send("Error fetching posts. " + e)
    }
});

router.get("/all", async function (req, res, next) {
    const limit = Number(req.query.limit)
    const skip = Number(req.query.skip)
    const sortField = req.query.sortField 
    const sortOrder = req.query.sortOrder 
    const filterField = req.query.filterField 
    const filterValue = req.query.filterValue
    const allPosts = await getPosts(limit, skip, sortField, sortOrder, filterField, filterValue)
    res.json(allPosts);
});

router.get("/singleblog/:blogId", async function (req, res, next) {
  const blogId = Number(req.params.blogId);
  const blogPost = await findPost(blogId)
  res.json(blogPost);
});

router.get("/authors", async function (req, res, next) {
    const authors = await getAuthors();
    res.json(authors);
})

router.get("/postblog", function (req, res, next) {
    res.render('postBlog');
})

router.get("/displayblogs", function (req, res, next) {
    res.render('displayBlogs');
})

router.get("/displaysingleblog", function (req, res, next) {
    res.render('displaySingleBlog');
})

router.post("/submit", async function (req, res, next) {
    const blogId = await getPostsCollectionLength() + 1;
    const title = req.body.title
    const text = req.body.text
    const author = req.body.author
    const category = req.body.category
   
    if (!title) {
        res.send("Title was not included!")
        return;
    }

    await makePost(blogId, title, text, author, category)

    res.send("OK");
})

router.put("/update-blog/:blogId", async function (req, res, next) {
    const blogId = Number(req.params.blogId)
    const title = req.body.title
    const text = req.body.text
    const author = req.body.author
    const category = req.body.category

    await updatePost(blogId, title, text, author, category)
    
    res.send("OK");
})

router.delete("/delete-blog/:blogIds", async (req, res)=> {
    const blogIds = req.params.blogIds.split(",").map((id)=>{return Number(id)})
    await deletePosts(blogIds)
    res.send("deleted blog")
})

module.exports = router;


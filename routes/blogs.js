var express = require("express");
var router = express.Router();

var blogsImport = require("../public/sampleBlogs");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.json("Blogs Index Route");
});

router.get("/all", function (req, res, next) {
    const sortOrder = req.query.sort;
    console.log(sortOrder)
    blogsImport.blogPosts.sort((a, b) => {
        if (sortOrder === "asc") {
            if (a.createdAt < b.createdAt) {
              return -1;
            }
            if (a.createdAt > b.createdAt) {
              return 1;
            }
        }
        if (sortOrder === "desc") {
            if (a.createdAt > b.createdAt) {
              return -1;
            }
            if (a.createdAt < b.createdAt) {
              return 1;
            }
        }
        return 0;
      })

  res.json(blogsImport.blogPosts);
});

router.get("/singleblog/:blogId", function (req, res, next) {
  const blogId = req.params.blogId;
  res.json(findBlogId(blogId));
});

router.get("/postblog", function (req, res, next) {
    res.render('postBlog');
})

router.get("/displayblogs", function (req, res, next) {
    res.render('displayBlogs');
})

router.get("/displaysingleblog", function (req, res, next) {
    res.render('displaySingleBlog');
})

router.post("/submit", function (req, res, next) {
    console.log(req.body)
    console.log("bloglist before ", blogsImport.blogPosts)
    const today = new Date()
    const newPost = {
        title: req.body.title,
        text: req.body.text,
        author: req.body.author,
        createdAt: today.toISOString(),
        id: String(blogsImport.blogPosts.length + 1)
    }
    blogsImport.blogPosts.push(newPost)
    console.log("bloglist after ", blogsImport.blogPosts)

    res.send("OK");
})

router.put("/update-blog/:blogId", function (req, res, next) {
    const blogId = String(req.params.blogId)
    const title = req.body.title
    const text = req.body.text
    const author = req.body.author

    const updatedBlogData = {
        title,
        text,
        author,
    }

    const updatedBlogList = generateUpdatedBlogs(blogsImport.blogPosts, blogId, updatedBlogData)
    console.log("updatedBlogList", updatedBlogList)
    saveBlogPosts(updatedBlogList)

    res.send("OK");
})

router.delete("/delete-blog/:blogId", (req, res)=> {
    const idOfBlogToDelete = req.params.blogId;
    const filteredPosts = generateFilteredBlogs(blogsImport.blogPosts, idOfBlogToDelete);

    saveBlogPosts(filteredPosts)
    setTimeout(() => {
        res.send("deleted blog")
    }, 5000);
})

const findBlogId = (blogId) => {
  const foundBlog = blogsImport.blogPosts.find(element => element.id === blogId);
  return foundBlog;
};

/* DRY
    DON'T
    REPEAT
    YOURSELF 
*/

const generateFilteredBlogs = (blogList, blogIdToDelete) => {

    const filteredBlogList = []
    
    for (let i; i < blogList.length; i++) {
        const currentBlog = blogList[i]
        if (currentBlog.id === blogIdToDelete) {
            continue;
        }
        filteredBlogList.push(currentBlog);
    }

    return filteredBlogList;
    // return blogList.filter((blog)=>blog.id !== blogId)
}

const generateUpdatedBlogs = (blogList, blogIdToUpdate, updatedBlogData) => {

    const updatedBlogList = []

    for (let i = 0; i < blogList.length; i++) {
        const currentBlog = blogList[i]
        if (currentBlog.id === blogIdToUpdate) {
            if (updatedBlogData.title !== currentBlog.title && updatedBlogData.title !== "") {
                currentBlog.title = updatedBlogData.title
            }
            if (updatedBlogData.text !== currentBlog.text && updatedBlogData.text !== "") {
                currentBlog.text = updatedBlogData.text
            }
            if (updatedBlogData.author !== currentBlog.author && updatedBlogData.author !== "") {
                currentBlog.author = updatedBlogData.author
            }
        }
        updatedBlogList.push(currentBlog)
    }

    return updatedBlogList;
    // return blogList.map((blog)=>{
    //     if (blog.id === blogIdToUpdate) {
    //         const newBlogData = {
    //             id: blog.id,
    //             createdAt: blog.createdAt,
    //             title: updatedBlog.title ? updatedBlog.title : blog.title,
    //             text: updatedBlog.text ? updatedBlog.text : blog.text,
    //             author: updatedBlog.author ? updatedBlog.author : blog.author
    //         }
    //         return newBlogData
    //     }
    //     return blog
    // })
}

const saveBlogPosts = (blogList) => {
    blogsImport.blogPosts = blogList;
}

module.exports = router;


const express = require("express");
const Tasks = require("../model")
const router = express.Router(); 

// calling auth middleware 
function ensureAuth( req, res, next ) {
    if( !req.session.user ) return res.direct( "/login" );
    next();
}

// Listing the tasks UI
router.get( "/", ensureAuth, async(req, res, next) => {
    try {
        const filter = {}; 
        if(req.query.status && [ "Pending", "Completed", "Deleted" ].includes(req.query.status)) {
            filter.status = req.query.status;
        } else {
            filter.status = { $ne: "Deleted" }; // default deleting 
        }
            filter.userID = req.session.user.id
            const tasks = await Task.find(filter).sort({ createdAt: -1 });
            res.render( "tasks/index", { tasks, filterStatus: req.query.status || "all" }); 
    } catch(err) {
        next(err);
    }
}); 

// UI to create form 
router.get( "/new", ensureAuth, (req, res) => res.render( "tasks/new")); 

// UI POST for creating 
router.post( "/new", ensureAuth, async ( req, res, next) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        await Task.create({ userId: req.session.user.id, title, description, dueDate: dueDate || null, priority: priority || "medium"});
        res.redirect("/tasks");
    } catch(err) { next(err)};
}); 


// ACTION to mark completed 
router.post( "//complete", ensureAuth, async(req, res, next) => {
    try {
        const t = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.session.user.id}, { status: "completed"}, { new: true});
        if(!t) throw { status: 404, message: "Particular task not found amigo"};
        res.redirect("/tasks");
    } catch (err) { next(err); }
});


// ACTION to delete 
router.post( "/delete", ensureAuth, async(req, res, next) => {
    try {
        const t = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.session.user.id}, { status: "deleted" }, { new: true })
        if(!t) throw{ status: 404, message: "Task is no where to be found" }
        res.redirect( "/tasks" );
    } catch(err) { next(err); }
}); 

// API endpoints (JSON) - consistent response format 
router.get( "/api", ensureAuth, async (req, res, next) => {
    try {
        const tasks = await Task.find({ userId: req.session.user.id, status: { $ne: "deleted" }}); 
        res.json({ success: true, data: tasks }); 
    } catch(err) { nexy(err); }
});

router.post( "/api", ensureAuth, async (req, res, next) => {
    try {
        const  { title, description, dueDate, priority } = req.body;
        const created = await Task.create({ userId: req.session.user.id, title, description, dueDate: dueDate || null, priority: priority || "medium" });
        res.status(201).json({ success: true, data: created });
    } catch (err) { next(err); }
});

router.put( "/api/", ensureAuth, async (req, res, next) => {
    try {
        const updated = await Task.findOneAndUpdate({ _id: req.params.user.id, userId: req.session.user.id }, 
            req.body, { new: true });
            if(!updated) return res.status(404).json({ success: false, message: "NOT FOUND AT ALL" });
            res.json({ success: true, data: updated });
    } catch (err) { next(err); }
}); 

router.delete( "/api", ensureAuth, async (req, res, next) => {
    try {
        const deleted = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.session.user.id }, { status: "deleted"}, { new: true });
        if( !deleted ) return res.status(404).json({ success: false, message: "NOT FOUND RARA" });
        res.json({ success: true, data: deleted }); 
    } catch (err) { next(err); }
});

module.exports = router;
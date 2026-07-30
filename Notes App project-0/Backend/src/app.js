//server ko create karna.

const express = require("express");
const cors = require("cors");
const noteModel = require("./models/note.model");
const app = express();



/*
note = {
    title: "my title",
    description: "my description"
}

const notes = [
    {
    title: "my title",
    description: "my description"
    },
    {
    title: "my title2",
    description: "my description2"
    }
]
*/


const notes = [];
app.use(cors());
app.use(express.json());
//title, description 


// POST /notes =>create a note
app.post("/notes",async (req, res) =>{
   const data = req.body; // {title, description} //ye data ko req.body se le rhe hai.

  await noteModel.create({
    title: data.title,
    description: data.description
   })

    //resource create howa hai islye 201. 
    res.status(201).json({
        message: "note created successfully",
    })

})

app.get("/notes", async (req, res) =>{

    const notes = await noteModel.find(); //return an array. //ye notes ko db se le rhe hai.



    //if not found it will return empty array.
 //findOne will return the first document that matches the query. If no documents match, it will return null object.
    res.status(200).json({
        message: "notes fetched successfully",
        notes: notes
    })
})

// delete /notes/:index
//dynamic so use the ":" it will be dynamic.
app.delete("/notes/:id", async (req, res) => {
    const id = req.params.id;

    const deletedNote = await noteModel.findOneAndDelete({
        _id: id
    });

    if (!deletedNote) {
        return res.status(404).json({
            message: "Note not found"
        });
    }

    res.status(200).json({
        message: "Note deleted successfully"
    });
});
app.patch("/notes/:id", async (req, res) => {

    const id = req.params.id; //ye index ko req.params se le rhe hai.
    const { title, description } = req.body; //ye title aur description ko req.body se le rhe hai.

    await noteModel.findOneAndUpdate({
        _id: id
    }, {
        title: title,
        description: description
    });

    res.status(200).json({
        message: "note updated successfully",
    })
});





module.exports = app;
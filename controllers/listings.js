const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const { category, search } = req.query;

    let filter = {};
    // Category filter
    if (category) {
        filter.category = category;
    }
    // Search filter
    if (search) {
        const searchText = search.trim();
          filter.$or = [
            {
                title: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: searchText,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: searchText,
                    $options: "i"
                }
            }
        ];
    }
    const allListings = await Listing.find(filter);
    res.render("./listings/index.ejs", {
        allListings,
        category,
        search
    });
};

module.exports.renderNewForm =  (req,res)=> {
   res.render("./listings/new.ejs");
};

module.exports.showListing = async(req,res)=> {
   let {id} = req.params;
   const listing = await Listing.findById(id)
     .populate({
        path: "reviews",
        populate: {
         path: "author",
        },
     })
     .populate("owner");
   if(!listing) {
      req.flash("error", "Listing you requested for does not exists");
      return res.redirect("/listings");
   }
   console.log(listing);
   res.render("./listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res)=> {
       let url = req.file.path;
       let filename= req.file.filename;
       const newListing = new Listing(req.body.listing);
       newListing.owner = req.user._id;
       newListing.image = {url, filename};
       newListing.geometry = {
               type: "Point",
               coordinates: [0, 0]
         };
      await newListing.save();
      req.flash("success","Successfully created a new listing!");
      res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
      req.flash("error", "Listing you requested for does not exists");
      return res.redirect("/listings");
    }

    let originalImageUrl= listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("./listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing = async (req,res)=> {
   let {id} = req.params;
   let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

   if(typeof req.file!= "undefined"){
    let url = req.file.path;
    let filename= req.file.filename;
    listing.image = {url , filename};
    await listing.save();

   }
   req.flash("success","Successfully updated the listing!");
   res.redirect(`/listings/${id}`); // redirect to show route
};

module.exports.destroyListing = async (req,res)=> {
   let {id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
   req.flash("success","Successfully deleted the listing!");
   res.redirect("/listings");
};
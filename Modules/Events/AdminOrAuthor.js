module.exports = (serverDocument, eventDocument, userDocument) => {
    let userID = userDocument._id;
    if(userID===eventDocument._author) {
        return true;
    } else {
        for(let i=0; i<serverDocument.config.admins.length; i++) {
            if(serverDocument.config.admins.length[i]._id===userID) {
                return true;
            }
        }
    }
    return false;
};

/// simple synchronous function which determines if a user has the rights to modify an event
module.exports = (serverDocument, eventDocument, memberObject) => {
    // allowed if owner of event
    if(memberObject.id===eventDocument._author) {
        return true;
    }
    // allowed if owner of server
    else if(memberObject.id===memberObject.guild.ownerID) {
        return true;
    }
    // allowed if admin on server
    else {
        for(let i=0; i<serverDocument.config.admins.length; i++) {
            // accept any admin level (placeholder for future configuration extensions)
            if(serverDocument.config.admins[i].level > 0) {
                // compare member roles to the current admin role
                for(let j=0; j<memberObject.roles.length; j++) {
                    if(serverDocument.config.admins[i]._id===memberObject.roles[i]) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};



module.exports = async srv =>{
    srv.on('jobs',async(req,res)=>{
        console.log("Started")
        try {

            let get_information = await SELECT.from("JOB_JOBS")
            console.log(get_information)

            return {
                jobs:get_information
            }

          
            
        } catch (error) {
            console.log(error)
        }
    })
}
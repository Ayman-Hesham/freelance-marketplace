import axios from "axios";

export const handleApiError = (error: any) => {
    if(axios.isAxiosError(error)){
        return {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,   
            code: error.code,
            timestamp: new Date().toISOString()
        }
    } else {
        console.log("Unexpected error ", error)
        return {
            message: "Unexpected error"
        }
    }
}

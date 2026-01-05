import request from './request'

export const logoutApi = (userId) => request.post("/s-user-info/recordLogin", {
	userId
})
export const recordsHistoryApi = params => request.post("/s-user-browse-logs/createBrowseLogs", params,)

export const recordsPvOrUvApi = params => request.get("/s-sys-uv/createUv", params)


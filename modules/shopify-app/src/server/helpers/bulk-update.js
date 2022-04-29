/**
 *
 * @param {{
 * handleGetData: Function, // get data from shopify
 * handleUpdate: Function, // update to my database
 * onUpdateChunk: Function, // call when update 1 chunk
 * onUpdateFinish: Function, // call when sync update data finish
 * onUpdateStart: Function, // call when sync update data finish
 * }}
 */

const bulkUpdate = async ({
  handleGetData,
  handleUpdate,
  onUpdateChunk,
  onUpdateFinish,
  onUpdateStart,
}) => {
  let totalItems = 0
  let nextPageParams = null

  console.log('\n\n')
  if (onUpdateStart) {
    onUpdateStart()
  }
  do {
    const { newData, params } = await handleGetData({
      defaultParams: nextPageParams,
    })
    nextPageParams = params
    totalItems += newData.length
    await handleUpdate(newData)
    if (onUpdateChunk) {
      onUpdateChunk({ totalItems, newData, nextPageParams })
    }
  } while (nextPageParams)
  if (onUpdateFinish) {
    onUpdateFinish({ totalItems })
  }
}

export default bulkUpdate

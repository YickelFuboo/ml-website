import { requestProduct } from './requestProduct.js'

const PREFIX = '/api/v1/products'

export async function getProductList(params = {}) {
  const { page = 1, page_size = 100, keyword } = params
  const query = { page, page_size }
  if (keyword != null && keyword !== '') query.keyword = keyword
  const res = await requestProduct(`${PREFIX}/list`, { method: 'GET' }, query)
  return res.items || []
}

export async function getProduct(productId) {
  return requestProduct(`${PREFIX}/${productId}`, { method: 'GET' })
}

export async function createProduct(body) {
  return requestProduct(`${PREFIX}`, {
    method: 'POST',
    body: JSON.stringify({
      name: body.name,
      description: body.description ?? null,
      product_define: body.product_define ?? null,
    }),
  })
}

export async function updateProduct(productId, body) {
  return requestProduct(`${PREFIX}/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: body.name,
      description: body.description,
      product_define: body.product_define,
    }),
  })
}

export async function deleteProduct(productId) {
  return requestProduct(`${PREFIX}/${productId}`, { method: 'DELETE' })
}

export async function getVersion(versionId) {
  return requestProduct(`${PREFIX}/versions/${versionId}`, { method: 'GET' })
}

export async function createVersion(body) {
  return requestProduct(`${PREFIX}/versions`, {
    method: 'POST',
    body: JSON.stringify({
      name: body.name,
      product_id: body.product_id,
    }),
  })
}

export async function updateVersion(versionId, body) {
  return requestProduct(`${PREFIX}/versions/${versionId}`, {
    method: 'PUT',
    body: JSON.stringify({ name: body.name }),
  })
}

export async function deleteVersion(versionId) {
  return requestProduct(`${PREFIX}/versions/${versionId}`, { method: 'DELETE' })
}

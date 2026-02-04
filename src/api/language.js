import { request } from './request.js'
import { language as languagePaths } from './paths.js'

/** 四、语言管理（对应后台「语言管理」模块） */

/** 获取支持的语言列表 */
export function getLanguageList() {
  return request(languagePaths.list)
}

/** 获取当前用户语言/站点语言 */
export function getCurrentLanguage() {
  return request(languagePaths.current)
}

/** 设置当前语言 */
export function setCurrentLanguage(locale) {
  return request(languagePaths.setCurrent, {
    method: 'PUT',
    body: JSON.stringify({ locale }),
  })
}

/** 获取某语言的文案（多语言包） */
export function getMessages(locale) {
  return request(languagePaths.messages(locale))
}

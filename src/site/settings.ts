/**
 * The few settings of the site that aren't in eurth.config.mjs, because browser code needs
 * them too (and may never import that file).
 */

/**
 * The forum category a new topic opens in when someone presses "Answer on the Eurth forum":
 * its slug, a subcategory as "parent/child". Undefined until Stijn has said which; the topic
 * then opens with no category chosen.
 */
export const FORUM_CATEGORY: string | undefined = undefined;

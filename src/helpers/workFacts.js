/**
 * Facts to show for a case study. Real `outcomes` (metrics you supply) win;
 * until a project has them, its `scope` (what was built) is shown instead.
 * Fill outcomes in profile.json as { "value": "40%", "label": "faster checkout" }.
 * @param {{ outcomes?: Array<{value:string,label:string}>, scope?: Array<{value:string,label:string}> }} work
 */
export default function workFacts(work) {
  if (work.outcomes?.length) return { title: 'Outcomes', items: work.outcomes }
  return { title: 'At a glance', items: work.scope || [] }
}

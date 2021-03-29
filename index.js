"use strict";
const github = require('octonode');
const renderer = require('./renderer')

run()
.then(()=>{
  console.log('done');
})
.catch((err)=>{
  console.error(`error: ${err.stack}`);
});

async function run() {

  const token = process.env['API_TOKEN'];
  const dryrun = Number(process.env['DRYRUN']) || false;

  console.log(`Dryrunning: ${dryrun}`);

  if (!token) {
    throw new Error('No token set. Set API_TOKEN');
  }
  
  let {client, repo} = await login(token, 'potmo/fact-a-day');
  
  let current_issues = await getCurrentIssues(client, repo);

  let unused_issues = await getUnusedIssues(client, repo);
  
  if (unused_issues.length == 0) {
    console.log('No new facts to publish');
  }

  let unused_issue = selectUnusedIssue(unused_issues, dryrun);

  console.log('Rendering');
  renderer.render(unused_issue.title, unused_issue.body, './build');

  if (dryrun) {
    console.log(`dryrunning so don't publish and unpublish`);
  } else {
    let published_issue = await publishIssue(client, repo, unused_issue)
    console.log(`new issue has title: ${published_issue.title}`)
    unpublishIssues(client, repo, current_issues);  
  }

}


function selectUnusedIssue(issues, dryrun) {
  let sorted = issues.sort(sortIssues);

  console.log('Facts priorities');
  sorted.forEach( i => {
    console.log(` ${i.number} ${i.title} ${i.labels.map(l => l.name).join(', ')}`);
  })

  if (dryrun) {
    let dryrunned_issue = sorted.filter(a => a.number == dryrun)[0];
    return dryrunned_issue;
  }
  return sorted[0];
}

function sortIssues(a, b) {
  let aLabels = a.labels.map(l => l.name);
  let bLabels = b.labels.map(l => l.name);

  let today = (new Date()).toISOString().split('T')[0];

  // this is the prio order
  let prios = [today, 'top-prio', 'mid-prio', 'low-prio'];

  // find the top prio label for both candidates
  let aPrio = Math.min(...aLabels.map( l => prios.indexOf(l)).filter(i => i >= 0));
  let bPrio = Math.min(...bLabels.map( l => prios.indexOf(l)).filter(i => i >= 0));


  if (aPrio != bPrio) {
    return aPrio - bPrio;
  }

  // if they are the same return on number
  return a.number - b.number;
}

async function login(token, repo_name) {
  console.log(`logging into ${repo_name}`);
  let client = github.client(token);
  let repo = client.repo(repo_name);
  return {client, repo};
}

async function unpublishIssues(client, repo, issues) {
  let issue_ids = issues.map(a => a.number);
  console.log(`unpublishing issues [${issue_ids.join(', ')}] of ${repo.name}`);
  for (let id of issue_ids) {
    await unpublishIssue(client, repo, id);
  }
}

async function unpublishIssue(client, repo, issue_id) {
  console.log(`unpublishing issue ${issue_id} of ${repo.name}`);
  let issue = repo.issue(issue_id);
  await issue.removeLabelAsync('current');
  //await issue.updateAsync({state: 'closed'});
}

async function publishIssue(client, repo, issue_data) {

  console.log(`publishing issue ${issue_data.number} of ${repo.name}`);

  let issue = repo.issue(issue_data.number);

  //await issue.createCommentAsync({body: `Publishing as of ${new Date().toISOString()}`});
  //await issue.updateAsync({state: 'closed'});
  await issue.addLabelsAsync(['published', 'current']);

  return issue_data;
}

async function getUnusedIssues(client, repo) {

  console.log(`loading unused issues for ${repo.name}`);
  
  let response = await client.search().issuesAsync({
    q: `state:open+repo:${repo.name}+is:open+-label:published+-label:holdback`,
    sort: 'created',
    order: 'asc'
  });

  let issues = response[0].items;
  return issues;
}

async function getCurrentIssues(client, repo) {

  console.log(`loading current issues for ${repo.name}`);
  
  let response = await client.search().issuesAsync({
    q: `state:open+repo:${repo.name}+is:open+label:published+label:current`,
    sort: 'created',
    order: 'asc'
  });

  let issues = response[0].items;
  return issues;
}



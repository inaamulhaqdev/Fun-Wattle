# Pipelines
Currently the codebase has 2 pipelines for when the Repo is set up in github.

## [Check](./check.yml)
The check pipeline does 3 tasks:
1) Run a Frontend linter to check the style of the JS code.
2) Run a Backend linter to check the style of the Python code.
3) Run the Backend test suite (more informatio can be found [here](../backend/controller/test/README.md)).

## [Main](./main.yml)
The backend of the codebase is hosted on [render](https://render.com/), on the Free tier. This means that the code will not always be running. This pipeline will use a render deploy URL to redeploy (and restart) the backend server. If the render account is changed, then the github deploy url will need to change. To do this:
1) Head to settings of the repo.
2) Go to secrets and variables then Actions in the dropdown.
3) Find the Render Deploy URL ([instruction](https://render.com/docs/deploys)).
4) If it does not exist, create a new secret called `RENDER_DEPLOY_HOOK_URL`, and add the url

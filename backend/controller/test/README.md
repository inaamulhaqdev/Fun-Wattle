# Testing 
The backend code comes with a set of premade tests to ensure that modification will keep the same logic follow. These tests are run as part of the Github runner (see [here](../../../.github/workflows/README.md)).

## Manually running the tests
Tests can be run with the command
```bash
python3 ./backend/manage.py test controller
```

## Adding more test files
As the code base evolves, so does the need for further test files. In order to make new test, make a new file called `test*.py` in the test file, and follow the structure set by the unittest module. More information can be found [here](https://docs.djangoproject.com/en/5.2/topics/testing/).
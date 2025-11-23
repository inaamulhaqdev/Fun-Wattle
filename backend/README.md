# Backend

This backend is written in Python, and managed with Django. In order to access the database on [supabase](https://supabase.com/), Django uses Object Relational Mapping (ORM) to link Python objects to supabase elements.

# File Walkthrough
Below is an explaination of all the important files in the directory:
- [requirements.txt](./requirements.txt)
This contains all python libraries that are to be installed, and used during runtime.
- [Dockerfile](./Dockerfile)
Where the backend Dockerfile is setup, and the run environment is created.
- [controller/models.py](./controller/models.py)
Where the models that are used in ORM are stored. In order to update them in the database, you must use a Django migration (read more [here](https://docs.djangoproject.com/en/5.2/topics/migrations/)).
- [controller/serializers.py](./controller/serializers.py)
Where the models are turned into JSON objects, so that they can be used by the API calls.
- [controller/views](./controller/views/)
This is where the API logic occurs, and majority of the code functionality for the backend is.
- [controller/urls.py](./controller/urls.py)
Where the views are set to a specific endpoint, so that they can be called in the API.
- [controller/test](./controller/test/)
The test files location. See more in the [README.md](./controller/test/README.md)


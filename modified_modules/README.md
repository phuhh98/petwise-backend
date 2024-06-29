# Notes

These modified files are specifically for the implementation of this repo to works. And have to take an eye on library update in order to avoid unpredicted changes - could lock version to ensure and always have to run `npm ci` to install packages

Could consider to raise bug report on langchain or request for feature update

## What is the change

- In @langchain/google-genai is modified files to accept type "media" and file uri to work with google file upload api and multi model
- In langchan/dist/storage is a modification to let it decode string back to object correctly

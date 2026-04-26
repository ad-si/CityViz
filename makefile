.PHONY: help
help: makefile
	@tail -n +4 makefile | grep ".PHONY"


node_modules: package.json package-lock.json
	if test ! -d $@; then npm install --force; fi


.PHONY: format
format:
	@echo "TODO"


.PHONY: test
test: node_modules
	npx mocha test


.PHONY: dev
dev: node_modules
	@echo "Dev server starting — open http://localhost:3000/"
	node app.js


.PHONY: checkStyle
checkStyle: node_modules
	npx jscs .
	npx jshint .

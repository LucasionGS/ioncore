@echo off

SET SERVER=server
SET CLIENT=client
SET OUTPUT=dist

REM Build client
echo Compiling CLIENT...
cd %CLIENT%
call yarn install
call yarn build

REM Build server
echo Compiling server...
cd ..\%SERVER%
call yarn install
call yarn run build-server

REM Combine
echo Combining CLIENT and server...
cd ..
IF EXIST %OUTPUT% (
  echo Removing old dist...
  rmdir /s /q %OUTPUT%
)
mkdir %OUTPUT%
move %SERVER%\build %OUTPUT%\%SERVER%
move %CLIENT%\dist %OUTPUT%\public
copy %SERVER%\package.json %OUTPUT%\package.json
call yarn install --production --cwd %OUTPUT%

REM Copy .env-production to .env
IF EXIST %SERVER%\.env-production (
  echo Copying %SERVER%\.env-production to .env...
  copy %SERVER%\.env-production %OUTPUT%\.env
) ELSE IF EXIST %SERVER%\.env (
  echo Copying %SERVER%\.env to .env...
  copy %SERVER%\.env %OUTPUT%\.env
) ELSE (
  echo No .env file found. Using default values.
)

REM Build finished
echo Build finished. Output in %cd%\%OUTPUT%

REM If post-build.bat exists, run it
IF EXIST post-build.bat (
  echo Running post-build.bat...
  call post-build.bat %cd%\%OUTPUT%
  IF ERRORLEVEL 1 (
    echo post-build.bat failed.
    exit /b 1
  )
  echo post-build.bat finished.
)

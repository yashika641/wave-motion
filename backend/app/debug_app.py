import sys
import pkgutil
import websockets

print("========== PYTHON INFO ==========")
print("Python Executable:", sys.executable)
print("Python Version:", sys.version)

print("\n========== WEBSOCKETS INFO ==========")
print("Websockets file:", websockets.__file__)
print("Websockets version:", websockets.__version__)

print("\n========== INSTALLED PACKAGES ==========")
for package in pkgutil.iter_modules():
    print(package.name)

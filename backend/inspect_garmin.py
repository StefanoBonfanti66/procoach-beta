
from garminconnect import Garmin
import inspect

print("Inspecting Garmin class methods:")
methods = [m for m in dir(Garmin) if not m.startswith("_")]
for m in methods:
    print(m)

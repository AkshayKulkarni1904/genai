# Contributing to Enterprise GenAI Practical Engineering

Thank you for your interest in contributing to the **Enterprise GenAI Practical Engineering** repository! We welcome contributions, bug fixes, enhancements, and architectural discussions.

---

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How to Contribute

### 1. Reporting Bugs
- Check the [GitHub Issues](https://github.com/AkshayKulkarni1904/genai/issues) to see if the issue has already been reported.
- If not, submit a new issue with a clear description, reproduction steps, and relevant log outputs.

### 2. Suggesting Enhancements
- Open a feature request describing the proposed concept, practical use case, and architectural alignment with Modules 7–13.

### 3. Submitting Pull Requests

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/genai.git
   cd genai
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Set up virtual environment**:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\Activate.ps1
   # Linux/macOS:
   source venv/bin/activate
   pip install -r requirements.txt
   ```
5. **Implement your changes**:
   - Ensure clean code architecture and adherence to standard PEP 8.
   - Update relevant module documentation if modifying concepts or practicals.
6. **Run the test suite**:
   ```bash
   pytest tests/ -v
   python run_all.py
   ```
7. **Commit and Push**:
   ```bash
   git commit -m "feat(module_X): add detailed description of change"
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** targeting the `main` branch with a clear summary of changes.

---

## Architectural Guidelines

- **Zero Unnecessary Dependencies**: Keep standard library usage prioritized where applicable; minimize heavy runtime overhead.
- **Enterprise Fixtures**: All datasets in `data/` directories should reflect realistic enterprise telemetry, configurations, and incident corpus schemas.
- **Test Coverage**: Every new API endpoint or workflow step must include automated verification in `tests/test_ui_api.py` or dedicated unit tests.

---

## Questions?

Feel free to start a discussion or open an issue on GitHub!
